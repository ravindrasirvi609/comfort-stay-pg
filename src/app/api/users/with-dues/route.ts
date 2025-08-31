import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import User from "@/app/api/models/User";
import UserDue from "@/app/api/models/UserDue";
import Payment from "@/app/api/models/Payment";

// GET /api/users/with-dues - Get users with enhanced due information
export async function GET(request: NextRequest) {
  try {
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "active";
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Build user query
    let userQuery: any = {};
    if (status === "active") {
      userQuery.isActive = true;
    } else if (status === "inactive") {
      userQuery.isActive = false;
      userQuery.isDeleted = { $ne: true };
    } else if (status === "deleted") {
      userQuery.isDeleted = true;
    }

    // Get users with populated room data
    const users = await User.find(userQuery)
      .populate("roomId", "roomNumber type price")
      .sort({ createdAt: -1 })
      .lean();

    // Get current month/year or use provided
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // Get current month dues for all users
    const userIds = users.map((user: any) => user._id);
    const dues = await UserDue.find({
      userId: { $in: userIds },
      year: targetYear,
      monthNumber: targetMonth,
      isActive: true,
    }).lean();

    // Create a map for quick due lookup
    const duesMap = new Map();
    dues.forEach((due: any) => {
      duesMap.set(due.userId.toString(), due);
    });

    // For users without due records, calculate legacy dues
    const currentMonthYear = `${new Date(targetYear, targetMonth - 1).toLocaleString("default", { month: "long" })} ${targetYear}`;

    // Get payments for current month for users without due records
    const usersWithoutDues = users.filter(
      (user: any) => !duesMap.has(user._id.toString())
    );
    const userIdsWithoutDues = usersWithoutDues.map((user: any) => user._id);

    const payments =
      userIdsWithoutDues.length > 0
        ? await Payment.find({
            userId: { $in: userIdsWithoutDues },
            months: currentMonthYear,
            paymentStatus: "Paid",
            isDepositPayment: false,
            isActive: true,
          }).lean()
        : [];

    // Create payments map
    const paymentsMap = new Map();
    payments.forEach((payment: any) => {
      const userId = payment.userId.toString();
      const existing = paymentsMap.get(userId) || 0;
      paymentsMap.set(userId, existing + payment.amount);
    });

    // Enhanced user data
    const enhancedUsers = users.map((user: any) => {
      const due = duesMap.get(user._id.toString());
      const roomPrice = user.roomId?.price || 0;

      if (due) {
        // User has due record - use enhanced data
        return {
          ...user,
          currentMonthRentStatus: due.dueStatus === "Paid" ? "Paid" : "Unpaid",
          dueAmount: due.remainingDue || 0,
          totalDue: due.totalDue || 0,
          currentMonthDue: due.currentMonthDue || 0,
          previousUnpaidDue: due.previousUnpaidDue || 0,
          isProrated: due.isProrated || false,
          daysCovered: due.daysCovered,
          totalDaysInMonth: due.totalDaysInMonth,
          checkInDate: due.checkInDate,
          proratedRent: due.proratedRent,
          fullMonthRent: due.fullMonthRent,
          dueStatus: due.dueStatus,
          dueDate: due.dueDate,
        };
      } else if (roomPrice > 0) {
        // Legacy calculation for users without due records
        const totalPaid = paymentsMap.get(user._id.toString()) || 0;
        const remainingDue = Math.max(0, roomPrice - totalPaid);

        return {
          ...user,
          currentMonthRentStatus: remainingDue === 0 ? "Paid" : "Unpaid",
          dueAmount: remainingDue,
          totalDue: remainingDue,
          currentMonthDue: remainingDue,
          previousUnpaidDue: 0,
          isProrated: false,
          proratedRent: roomPrice,
          fullMonthRent: roomPrice,
          dueStatus: remainingDue === 0 ? "Paid" : "Unpaid",
        };
      } else {
        // No room assigned
        return {
          ...user,
          currentMonthRentStatus: "N/A",
          dueAmount: 0,
          totalDue: 0,
          currentMonthDue: 0,
          previousUnpaidDue: 0,
          isProrated: false,
          dueStatus: "N/A",
        };
      }
    });

    // Calculate summary statistics
    const summary = enhancedUsers.reduce(
      (acc: any, user: any) => {
        if (user.currentMonthRentStatus === "Paid") {
          acc.paidCount++;
        } else if (
          user.currentMonthRentStatus === "Unpaid" &&
          user.totalDue > 0
        ) {
          acc.unpaidCount++;
          acc.totalUnpaidAmount += user.totalDue;
          acc.currentMonthDue += user.currentMonthDue;
          acc.previousUnpaidDue += user.previousUnpaidDue;
        }
        return acc;
      },
      {
        paidCount: 0,
        unpaidCount: 0,
        totalUnpaidAmount: 0,
        currentMonthDue: 0,
        previousUnpaidDue: 0,
      }
    );

    return NextResponse.json({
      success: true,
      users: enhancedUsers,
      summary,
      targetMonth,
      targetYear,
      targetMonthName: new Date(targetYear, targetMonth - 1).toLocaleString(
        "default",
        { month: "long" }
      ),
    });
  } catch (error) {
    console.error("Error fetching users with dues:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
