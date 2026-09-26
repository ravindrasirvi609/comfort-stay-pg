import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin, isAdminOrManager } from "@/app/lib/auth";
import Expense from "../models/Expense";
import mongoose from "mongoose";

// GET: List expenses
export async function GET(request: NextRequest) {
  await connectToDatabase();
  const { isAuth, user } = await isAuthenticated();
  if (!isAuth || !user) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const mine = url.searchParams.get("mine");

  let query = {};
  if (mine === "true") {
    // Scope to the calling user's own expenses
    if (
      typeof user._id === "string" &&
      mongoose.Types.ObjectId.isValid(user._id)
    ) {
      query = { createdBy: user._id };
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid user ID for expenses query" },
        { status: 400 }
      );
    }
  } else {
    // Only admin or manager can list all expenses
    if (!isAdminOrManager(user)) {
      return NextResponse.json(
        { success: false, message: "Admin or manager access required" },
        { status: 403 }
      );
    }
  }
  // Admin/manager can see all
  const expenses = await Expense.find(query)
    .populate("createdBy", "email name")
    .sort({ createdAt: -1 });
  return NextResponse.json({ success: true, expenses });
}

// POST: Create new expense
export async function POST(request: NextRequest) {
  await connectToDatabase();
  const { isAuth, user } = await isAuthenticated();

  if (!isAuth || !user) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  // Only admin or manager can create expenses
  if (!isAdminOrManager(user)) {
    return NextResponse.json(
      { success: false, message: "Admin or manager access required" },
      { status: 403 }
    );
  }

  // Validate user._id is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(user._id)) {
    return NextResponse.json(
      { success: false, message: "Invalid user ID for expense creation" },
      { status: 400 }
    );
  }

  const { amount, category, description, date } = await request.json();
  if (!amount || !category || !description || !date) {
    return NextResponse.json(
      { success: false, message: "All fields are required" },
      { status: 400 }
    );
  }

  const newExpense = new Expense({
    amount,
    category,
    description,
    date,
    createdBy: user._id,
    status: "Pending",
  });
  await newExpense.save();
  return NextResponse.json({ success: true, expense: newExpense });
}

// PUT: Admin approve/reject expense
export async function PUT(request: NextRequest) {
  await connectToDatabase();
  const { isAuth, user } = await isAuthenticated();
  if (!isAuth || !user || !isAdmin(user)) {
    return NextResponse.json(
      { success: false, message: "Admin only" },
      { status: 403 }
    );
  }
  const { expenseId, status } = await request.json();
  if (!expenseId || !["Approved", "Rejected"].includes(status)) {
    return NextResponse.json(
      { success: false, message: "Invalid request" },
      { status: 400 }
    );
  }
  const expense = await Expense.findByIdAndUpdate(
    expenseId,
    { status },
    { new: true }
  );
  if (!expense) {
    return NextResponse.json(
      { success: false, message: "Expense not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, expense });
}
