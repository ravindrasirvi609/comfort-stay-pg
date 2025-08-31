import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import UserDue from "@/app/api/models/UserDue";
import Payment from "@/app/api/models/Payment";
import { calculateTotalDue } from "@/app/utils/proratedRentCalculation";

// GET /api/user-dues/[id] - Get specific user due
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = params;

    const due = await UserDue.findById(id)
      .populate("userId", "name email pgId phone roomId")
      .populate({
        path: "userId",
        populate: {
          path: "roomId",
          select: "roomNumber type price",
        },
      });

    if (!due) {
      return NextResponse.json(
        { success: false, message: "Due not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (!isAdmin(user) && due.userId._id.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      due,
    });
  } catch (error) {
    console.error("Error fetching user due:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/user-dues/[id] - Update user due (admin only)
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { id } = params;
    const updateData = await request.json();

    const due = await UserDue.findById(id);
    if (!due) {
      return NextResponse.json(
        { success: false, message: "Due not found" },
        { status: 404 }
      );
    }

    // Update the due with provided data
    Object.assign(due, updateData);
    due.updatedAt = new Date();

    // Recalculate due status if payment amounts changed
    if (updateData.totalPaid !== undefined) {
      due.updatePaymentStatus();
    }

    await due.save();

    return NextResponse.json({
      success: true,
      message: "Due updated successfully",
      due,
    });
  } catch (error) {
    console.error("Error updating user due:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/user-dues/[id] - Soft delete user due (admin only)
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { id } = params;

    const due = await UserDue.findById(id);
    if (!due) {
      return NextResponse.json(
        { success: false, message: "Due not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    due.isActive = false;
    due.updatedAt = new Date();
    await due.save();

    return NextResponse.json({
      success: true,
      message: "Due deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user due:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
