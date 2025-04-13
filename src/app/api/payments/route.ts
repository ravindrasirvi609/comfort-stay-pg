import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import Payment from "@/app/api/models/Payment";
import User from "@/app/api/models/User";

// Get all payments
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    let payments;

    // If admin, get all payments
    if (isAdmin(user)) {
      // Get URL parameters
      const url = new URL(request.url);
      const userId = url.searchParams.get("userId");
      const status = url.searchParams.get("status");
      const month = url.searchParams.get("month");
      // Build query based on parameters
      const query: Record<string, string | boolean> = { isActive: true };
      if (userId) query.userId = userId;
      if (status) query.status = status;
      if (month) query.month = month;

      payments = await Payment.find(query)
        .populate("userId", "name email pgId")
        .sort({ paymentDate: -1 });
    } else {
      // For normal users, only get their payments
      payments = await Payment.find({
        userId: user._id,
        isActive: true,
      }).sort({ paymentDate: -1 });
    }

    return NextResponse.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Get payments error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new payment (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Admin privileges required.",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const {
      userId,
      amount,
      month,
      paymentDate,
      dueDate,
      status,
      remarks,
      paymentMethod,
      transactionId,
    } = await request.json();

    // Validate required fields
    if (!userId || !amount || !month || !dueDate) {
      return NextResponse.json(
        { success: false, message: "Please provide all required fields" },
        { status: 400 }
      );
    }

    // Check if user exists
    const userExists = await User.findById(userId);

    if (!userExists) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Generate unique receipt number (timestamp + user id last 5 chars)
    const timestamp = Date.now().toString();
    const userIdShort = userId.toString().slice(-5);
    const receiptNumber = `PG-${timestamp.slice(-8)}-${userIdShort}`;

    // Create new payment record
    const newPayment = new Payment({
      userId,
      amount,
      month,
      paymentDate: paymentDate || new Date(),
      dueDate,
      status: status || "Paid",
      receiptNumber,
      paymentMethod,
      transactionId,
      remarks,
    });

    await newPayment.save();

    return NextResponse.json({
      success: true,
      message: "Payment recorded successfully",
      payment: newPayment,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
