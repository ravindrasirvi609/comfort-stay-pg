import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import DueSettlement from "@/app/api/models/DueSettlement";
import User from "@/app/api/models/User";
import {
  validateSettlement,
  calculateDueWithSettlements,
  getSettlementSummary,
  getUserCurrentDue,
} from "@/app/lib/dueCalculator";

// POST /api/users/[id]/settle-due - Settle a user's due amount
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const params = await props.params;
    const { id: userId } = params;

    // Validate user exists
    const targetUser = await User.findById(userId);
    if (!targetUser || !targetUser.isActive) {
      return NextResponse.json(
        { success: false, message: "User not found or inactive" },
        { status: 404 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { month, amount, reason, remarks } = body;

    // Validate required fields
    if (!month || !amount || !reason) {
      return NextResponse.json(
        {
          success: false,
          message: "Month, amount, and reason are required",
        },
        { status: 400 }
      );
    }

    // Validate month format
    if (!/^[A-Za-z]+ \d{4}$/.test(month)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Month must be in "Month Year" format (e.g., "September 2025")',
        },
        { status: 400 }
      );
    }

    // Validate amount
    const settlementAmount = parseFloat(amount);
    if (isNaN(settlementAmount) || settlementAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Settlement amount must be a positive number",
        },
        { status: 400 }
      );
    }

    // Validate settlement against current dues
    const validation = await validateSettlement(
      userId,
      month,
      settlementAmount
    );
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error,
          maxSettlableAmount: validation.maxSettlableAmount,
          currentDue: validation.currentDue,
        },
        { status: 400 }
      );
    }

    // Create settlement record
    const settlement = new DueSettlement({
      userId,
      month,
      amount: settlementAmount,
      reason,
      remarks: remarks || undefined,
      settledBy: user._id,
      settledAt: new Date(),
      isActive: true,
    });

    await settlement.save();

    // Get updated due amount
    const remainingDue = await getUserCurrentDue(userId, month);

    // Populate settlement for response
    await settlement.populate([
      { path: "userId", select: "name email pgId" },
      { path: "settledBy", select: "name email" },
    ]);

    return NextResponse.json({
      success: true,
      message: "Due amount settled successfully",
      settlement: {
        _id: settlement._id,
        userId: settlement.userId,
        month: settlement.month,
        amount: settlement.amount,
        reason: settlement.reason,
        remarks: settlement.remarks,
        settledBy: settlement.settledBy,
        settledAt: settlement.settledAt,
      },
      remainingDue,
    });
  } catch (error) {
    console.error("Error settling due amount:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to settle due amount",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET /api/users/[id]/settle-due - Get settlement history for a user
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const params = await props.params;
    const { id: userId } = params;
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Validate user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (month) {
      // Get settlement summary for specific month
      const summary = await getSettlementSummary(userId, month);

      return NextResponse.json({
        success: true,
        month,
        ...summary,
      });
    } else {
      // Get settlement history across all months
      const settlements = await DueSettlement.find({
        userId,
        isActive: true,
      })
        .populate("settledBy", "name email")
        .sort({ settledAt: -1 })
        .limit(limit);

      const totalSettled = settlements.reduce(
        (sum, settlement) => sum + settlement.amount,
        0
      );

      return NextResponse.json({
        success: true,
        settlements: settlements.map((settlement) => ({
          _id: settlement._id,
          month: settlement.month,
          amount: settlement.amount,
          reason: settlement.reason,
          remarks: settlement.remarks,
          settledBy: {
            name: (settlement.settledBy as any).name,
            email: (settlement.settledBy as any).email,
          },
          settledAt: settlement.settledAt,
        })),
        totalSettled,
        count: settlements.length,
      });
    }
  } catch (error) {
    console.error("Error fetching settlement history:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch settlement history",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
