import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import UserDue from "@/app/api/models/UserDue";
import Payment from "@/app/api/models/Payment";
import User from "@/app/api/models/User";
import { calculateTotalDue } from "@/app/utils/proratedRentCalculation";

// POST /api/user-dues/recalculate - Recalculate dues for a user
export async function POST(request: NextRequest) {
  try {
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { userId, month, year, monthNumber } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // If specific month provided, recalculate for that month only
    if (month && year && monthNumber) {
      return await recalculateMonthlyDue(userId, month, year, monthNumber);
    }

    // Otherwise recalculate all active dues for the user
    return await recalculateAllUserDues(userId);
  } catch (error) {
    console.error("Error recalculating dues:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

async function recalculateMonthlyDue(
  userId: string,
  month: string,
  year: number,
  monthNumber: number
) {
  try {
    // Get the due record
    const due = await UserDue.findOne({
      userId,
      year,
      monthNumber,
      isActive: true,
    });

    if (!due) {
      return NextResponse.json(
        { success: false, message: "Due record not found" },
        { status: 404 }
      );
    }

    // Get payments for this month
    const monthYear = `${month} ${year}`;
    const payments = await Payment.find({
      userId,
      months: monthYear,
      paymentStatus: "Paid",
      isDepositPayment: false,
      isActive: true,
    });

    const totalPaid = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Get previous unpaid dues
    let previousUnpaidDue = 0;
    const previousMonthDues = await UserDue.find({
      userId,
      $or: [
        { year: { $lt: year } },
        { year: year, monthNumber: { $lt: monthNumber } },
      ],
      remainingDue: { $gt: 0 },
      isActive: true,
    });

    previousUnpaidDue = previousMonthDues.reduce(
      (sum, prevDue) => sum + prevDue.remainingDue,
      0
    );

    // Calculate total due
    const dueCalc = calculateTotalDue(
      due.proratedRent,
      previousUnpaidDue,
      totalPaid
    );

    // Update due record
    due.totalDue = dueCalc.totalDue;
    due.currentMonthDue = dueCalc.currentMonthDue;
    due.previousUnpaidDue = dueCalc.previousUnpaidDue;
    due.totalPaid = dueCalc.totalPaid;
    due.remainingDue = dueCalc.remainingDue;
    due.dueStatus = dueCalc.dueStatus;
    due.updatedAt = new Date();

    await due.save();

    // Also update any future months that might be affected by this change
    const futureMonthDues = await UserDue.find({
      userId,
      $or: [
        { year: { $gt: year } },
        { year: year, monthNumber: { $gt: monthNumber } },
      ],
      isActive: true,
    }).sort({ year: 1, monthNumber: 1 });

    // Recalculate future months
    for (const futureDue of futureMonthDues) {
      const futureMonthYear = `${futureDue.month} ${futureDue.year}`;
      const futurePayments = await Payment.find({
        userId,
        months: futureMonthYear,
        paymentStatus: "Paid",
        isDepositPayment: false,
        isActive: true,
      });

      const futureTotalPaid = futurePayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      // Get previous unpaid for this future month
      let futurePreviousUnpaid = 0;
      const futurePreviousDues = await UserDue.find({
        userId,
        $or: [
          { year: { $lt: futureDue.year } },
          { year: futureDue.year, monthNumber: { $lt: futureDue.monthNumber } },
        ],
        remainingDue: { $gt: 0 },
        isActive: true,
      });

      futurePreviousUnpaid = futurePreviousDues.reduce(
        (sum, prevDue) => sum + prevDue.remainingDue,
        0
      );

      const futureDueCalc = calculateTotalDue(
        futureDue.proratedRent,
        futurePreviousUnpaid,
        futureTotalPaid
      );

      futureDue.totalDue = futureDueCalc.totalDue;
      futureDue.previousUnpaidDue = futureDueCalc.previousUnpaidDue;
      futureDue.totalPaid = futureDueCalc.totalPaid;
      futureDue.remainingDue = futureDueCalc.remainingDue;
      futureDue.dueStatus = futureDueCalc.dueStatus;
      futureDue.updatedAt = new Date();

      await futureDue.save();
    }

    return NextResponse.json({
      success: true,
      message: "Monthly due recalculated successfully",
      due,
      affectedFutureMonths: futureMonthDues.length,
    });
  } catch (error) {
    console.error("Error recalculating monthly due:", error);
    throw error;
  }
}

async function recalculateAllUserDues(userId: string) {
  try {
    // Get all active dues for the user, sorted chronologically
    const allDues = await UserDue.find({
      userId,
      isActive: true,
    }).sort({ year: 1, monthNumber: 1 });

    if (allDues.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active dues found for user",
        recalculatedCount: 0,
      });
    }

    let recalculatedCount = 0;

    // Process each month chronologically to ensure previous unpaid amounts are correct
    for (const due of allDues) {
      // Get payments for this month
      const monthYear = `${due.month} ${due.year}`;
      const payments = await Payment.find({
        userId,
        months: monthYear,
        paymentStatus: "Paid",
        isDepositPayment: false,
        isActive: true,
      });

      const totalPaid = payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      // Get previous unpaid dues (only from processed months to avoid double counting)
      let previousUnpaidDue = 0;
      const previousMonthDues = await UserDue.find({
        userId,
        $or: [
          { year: { $lt: due.year } },
          { year: due.year, monthNumber: { $lt: due.monthNumber } },
        ],
        remainingDue: { $gt: 0 },
        isActive: true,
      });

      previousUnpaidDue = previousMonthDues.reduce(
        (sum, prevDue) => sum + prevDue.remainingDue,
        0
      );

      // Calculate total due
      const dueCalc = calculateTotalDue(
        due.proratedRent,
        previousUnpaidDue,
        totalPaid
      );

      // Update due record
      const wasChanged =
        due.totalDue !== dueCalc.totalDue ||
        due.previousUnpaidDue !== dueCalc.previousUnpaidDue ||
        due.totalPaid !== dueCalc.totalPaid ||
        due.remainingDue !== dueCalc.remainingDue ||
        due.dueStatus !== dueCalc.dueStatus;

      if (wasChanged) {
        due.totalDue = dueCalc.totalDue;
        due.currentMonthDue = dueCalc.currentMonthDue;
        due.previousUnpaidDue = dueCalc.previousUnpaidDue;
        due.totalPaid = dueCalc.totalPaid;
        due.remainingDue = dueCalc.remainingDue;
        due.dueStatus = dueCalc.dueStatus;
        due.updatedAt = new Date();

        await due.save();
        recalculatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "All user dues recalculated successfully",
      recalculatedCount,
      totalDues: allDues.length,
    });
  } catch (error) {
    console.error("Error recalculating all user dues:", error);
    throw error;
  }
}

// GET /api/user-dues/recalculate - Get recalculation status
export async function GET(request: NextRequest) {
  try {
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Get summary statistics
    const stats = await UserDue.aggregate([
      ...(userId
        ? [{ $match: { userId: userId, isActive: true } }]
        : [{ $match: { isActive: true } }]),
      {
        $group: {
          _id: null,
          totalDues: { $sum: 1 },
          totalAmount: { $sum: "$totalDue" },
          totalPaid: { $sum: "$totalPaid" },
          totalRemaining: { $sum: "$remainingDue" },
          paidCount: {
            $sum: { $cond: [{ $eq: ["$dueStatus", "Paid"] }, 1, 0] },
          },
          unpaidCount: {
            $sum: { $cond: [{ $eq: ["$dueStatus", "Unpaid"] }, 1, 0] },
          },
          partialCount: {
            $sum: { $cond: [{ $eq: ["$dueStatus", "Partial"] }, 1, 0] },
          },
          overdueCount: {
            $sum: { $cond: [{ $eq: ["$dueStatus", "Overdue"] }, 1, 0] },
          },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      stats: stats[0] || {
        totalDues: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalRemaining: 0,
        paidCount: 0,
        unpaidCount: 0,
        partialCount: 0,
        overdueCount: 0,
      },
    });
  } catch (error) {
    console.error("Error getting recalculation status:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
