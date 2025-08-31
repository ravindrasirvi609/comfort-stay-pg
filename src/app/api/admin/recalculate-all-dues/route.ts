import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import UserDue from "@/app/api/models/UserDue";
import Payment from "@/app/api/models/Payment";
import User from "@/app/api/models/User";
import { calculateTotalDue } from "@/app/utils/proratedRentCalculation";

// POST /api/admin/recalculate-all-dues - Force recalculate all user dues (admin only)
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

    // Get all users with active dues
    const allUserDues = await UserDue.find({
      isActive: true,
    })
      .populate("userId", "name email pgId")
      .sort({ userId: 1, year: 1, monthNumber: 1 });

    if (allUserDues.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No dues found to recalculate",
        stats: {
          totalProcessed: 0,
          updated: 0,
          errors: 0,
        },
      });
    }

    // Group dues by user
    const userDuesMap = new Map();
    allUserDues.forEach((due: any) => {
      const userId = due.userId._id.toString();
      if (!userDuesMap.has(userId)) {
        userDuesMap.set(userId, []);
      }
      userDuesMap.get(userId).push(due);
    });

    let totalProcessed = 0;
    let updated = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    // Process each user's dues chronologically
    const userIds = Array.from(userDuesMap.keys());
    for (const userId of userIds) {
      const userDues = userDuesMap.get(userId);
      if (!userDues) continue;

      try {
        const sortedDues = userDues.sort((a: any, b: any) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.monthNumber - b.monthNumber;
        });

        for (const due of sortedDues) {
          totalProcessed++;

          // Get payments for this specific month
          const monthYear = `${due.month} ${due.year}`;
          const payments = await Payment.find({
            userId: due.userId._id,
            months: monthYear,
            paymentStatus: "Paid",
            isDepositPayment: false,
            isActive: true,
          });

          const totalPaid = payments.reduce(
            (sum: number, payment: any) => sum + payment.amount,
            0
          );

          // Get previous unpaid dues (only from months before this one)
          const previousMonthDues = await UserDue.find({
            userId: due.userId._id,
            $or: [
              { year: { $lt: due.year } },
              { year: due.year, monthNumber: { $lt: due.monthNumber } },
            ],
            remainingDue: { $gt: 0 },
            isActive: true,
          });

          const previousUnpaidDue = previousMonthDues.reduce(
            (sum: number, prevDue: any) => sum + prevDue.remainingDue,
            0
          );

          // Calculate updated due amounts
          const dueCalc = calculateTotalDue(
            due.proratedRent,
            previousUnpaidDue,
            totalPaid
          );

          // Check if update is needed
          const needsUpdate =
            due.totalDue !== dueCalc.totalDue ||
            due.currentMonthDue !== dueCalc.currentMonthDue ||
            due.previousUnpaidDue !== dueCalc.previousUnpaidDue ||
            due.totalPaid !== dueCalc.totalPaid ||
            due.remainingDue !== dueCalc.remainingDue ||
            due.dueStatus !== dueCalc.dueStatus;

          if (needsUpdate) {
            due.totalDue = dueCalc.totalDue;
            due.currentMonthDue = dueCalc.currentMonthDue;
            due.previousUnpaidDue = dueCalc.previousUnpaidDue;
            due.totalPaid = dueCalc.totalPaid;
            due.remainingDue = dueCalc.remainingDue;
            due.dueStatus = dueCalc.dueStatus;
            due.updatedAt = new Date();

            await due.save();
            updated++;
          }
        }
      } catch (error) {
        errors++;
        errorDetails.push(
          `User ${userId}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        console.error(`Error processing user ${userId}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Bulk recalculation completed",
      stats: {
        totalProcessed,
        updated,
        errors,
        usersProcessed: userDuesMap.size,
      },
      errorDetails: errorDetails.slice(0, 10), // Limit error details to first 10
    });
  } catch (error) {
    console.error("Error in bulk recalculation:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/admin/recalculate-all-dues - Get recalculation statistics
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

    // Get summary statistics
    const stats = await UserDue.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalDues: { $sum: 1 },
          totalAmount: { $sum: "$totalDue" },
          totalPaid: { $sum: "$totalPaid" },
          totalRemaining: { $sum: "$remainingDue" },
          avgDueAmount: { $avg: "$remainingDue" },
          paidCount: {
            $sum: {
              $cond: [{ $eq: ["$dueStatus", "Paid"] }, 1, 0],
            },
          },
          unpaidCount: {
            $sum: {
              $cond: [
                { $in: ["$dueStatus", ["Unpaid", "Partial", "Overdue"]] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const summary = stats[0] || {
      totalDues: 0,
      totalAmount: 0,
      totalPaid: 0,
      totalRemaining: 0,
      avgDueAmount: 0,
      paidCount: 0,
      unpaidCount: 0,
    };

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Error fetching recalculation stats:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
