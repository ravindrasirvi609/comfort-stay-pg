import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import User from "@/app/api/models/User";
import UserDue from "@/app/api/models/UserDue";
import Payment from "@/app/api/models/Payment";
import DueSettlement from "@/app/api/models/DueSettlement";
import { calculateDueWithSettlements } from "@/app/lib/dueCalculator";

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

    // Calculate comprehensive payment data for each user
    const allUserPayments = await Payment.find({
      userId: { $in: userIds },
      paymentStatus: "Paid",
      isDepositPayment: false,
      isActive: true,
    }).lean();

    // Create payment map for all users
    const allPaymentsMap = new Map();
    allUserPayments.forEach((payment: any) => {
      const userId = payment.userId.toString();
      const existing = allPaymentsMap.get(userId) || 0;
      allPaymentsMap.set(userId, existing + payment.amount);
    });

    // Enhanced user data (with settlements)
    const enhancedUsers = await Promise.all(
      users.map(async (user: any) => {
        const due = duesMap.get(user._id.toString());
        const roomPrice = user.roomId?.price || 0;
        const moveInDate = user.moveInDate ? new Date(user.moveInDate) : null;
        const currentDate = new Date(targetYear, targetMonth - 1);

        // Calculate total paid across all months
        const totalPaidAllTime = allPaymentsMap.get(user._id.toString()) || 0;

        // Calculate "Rent Till Now" - cumulative rent from check-in to current month
        let rentTillNow = 0;
        if (moveInDate && roomPrice > 0) {
          const moveInYear = moveInDate.getFullYear();
          const moveInMonth = moveInDate.getMonth() + 1;

          // Calculate rent for each month from check-in to current month
          for (let year = moveInYear; year <= targetYear; year++) {
            const startMonth = year === moveInYear ? moveInMonth : 1;
            const endMonth = year === targetYear ? targetMonth : 12;

            for (let month = startMonth; month <= endMonth; month++) {
              if (year === moveInYear && month === moveInMonth) {
                // First month - calculate prorated rent
                const daysInMonth = new Date(year, month, 0).getDate();
                const checkInDay = moveInDate.getDate();
                const daysCovered = daysInMonth - checkInDay + 1;
                const dailyRate = roomPrice / daysInMonth;
                rentTillNow += Math.ceil(dailyRate * daysCovered);
              } else {
                // Full month rent
                rentTillNow += roomPrice;
              }
            }
          }
        }

        if (due) {
          // User has due record - use enhanced data with settlements
          const currentMonthYear = `${new Date(targetYear, targetMonth - 1).toLocaleString("default", { month: "long" })} ${targetYear}`;

          // Calculate due amount including settlements
          try {
            const dueWithSettlements = await calculateDueWithSettlements(
              user._id.toString(),
              currentMonthYear,
              due.currentMonthDue || 0,
              due.previousUnpaidDue || 0
            );

            // Use settlement-aware calculation
            const actualDueAmount = dueWithSettlements.effectiveDue;
            const actualStatus = dueWithSettlements.dueStatus;

            return {
              ...user,
              currentMonthRentStatus: actualStatus,
              dueAmount: actualDueAmount, // This includes settlement deductions
              totalDue: dueWithSettlements.totalDue,
              currentMonthDue: dueWithSettlements.currentMonthDue,
              previousUnpaidDue: dueWithSettlements.previousUnpaidDue,
              totalPaidForMonth: dueWithSettlements.totalPaid,
              totalPaidAllTime,
              totalSettled: dueWithSettlements.totalSettled, // New field
              rentTillNow,
              hasSettlements: dueWithSettlements.hasSettlements, // New field
              isProrated: due.isProrated || false,
              daysCovered: due.daysCovered,
              totalDaysInMonth: due.totalDaysInMonth,
              checkInDate: due.checkInDate,
              proratedRent: due.proratedRent,
              fullMonthRent: due.fullMonthRent,
              dueStatus: actualStatus,
              dueDate: due.dueDate,
            };
          } catch (error) {
            console.error(
              `Error calculating settlements for user ${user._id}:`,
              error
            );

            // Fallback to original calculation if settlement calculation fails
            const actualDueAmount = Math.max(0, rentTillNow - totalPaidAllTime);
            const actualStatus =
              actualDueAmount === 0
                ? "Paid"
                : totalPaidAllTime > 0
                  ? "Partial"
                  : "Unpaid";

            return {
              ...user,
              currentMonthRentStatus: actualStatus,
              dueAmount: actualDueAmount,
              totalDue: rentTillNow,
              currentMonthDue: due.currentMonthDue || 0,
              previousUnpaidDue: due.previousUnpaidDue || 0,
              totalPaidForMonth: due.totalPaid || 0,
              totalPaidAllTime,
              totalSettled: 0, // Fallback
              rentTillNow,
              hasSettlements: false, // Fallback
              isProrated: due.isProrated || false,
              daysCovered: due.daysCovered,
              totalDaysInMonth: due.totalDaysInMonth,
              checkInDate: due.checkInDate,
              proratedRent: due.proratedRent,
              fullMonthRent: due.fullMonthRent,
              dueStatus: actualStatus,
              dueDate: due.dueDate,
            };
          }
        } else if (roomPrice > 0) {
          // Legacy calculation for users without due records
          // Need to calculate settlements for this user
          const currentMonthYear = `${new Date(targetYear, targetMonth - 1).toLocaleString("default", { month: "long" })} ${targetYear}`;
          
          // Get existing settlements for this user for the current month
          const userSettlements = await DueSettlement.find({
            userId: user._id.toString(),
            month: currentMonthYear,
            isActive: true,
          });
          
          const totalSettled = userSettlements.reduce((sum, settlement) => sum + settlement.amount, 0);
          
          // Use the correct calculation: Rent Till Now - Total Paid All Time - Total Settled
          const actualDueAmount = Math.max(0, rentTillNow - totalPaidAllTime - totalSettled);
          const actualStatus =
            actualDueAmount === 0
              ? "Paid"
              : totalPaidAllTime > 0 || totalSettled > 0
                ? "Partial"
                : "Unpaid";

          return {
            ...user,
            currentMonthRentStatus: actualStatus,
            dueAmount: actualDueAmount, // Settlement-aware due amount
            totalDue: rentTillNow, // Total rent obligation
            currentMonthDue: roomPrice, // Current month rent
            previousUnpaidDue: Math.max(0, rentTillNow - roomPrice), // Previous months
            totalPaidForMonth: paymentsMap.get(user._id.toString()) || 0,
            totalPaidAllTime,
            totalSettled, // Include settlements
            rentTillNow,
            hasSettlements: totalSettled > 0, // Check if user has settlements
            isProrated: false,
            proratedRent: roomPrice,
            fullMonthRent: roomPrice,
            dueStatus: actualStatus,
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
            totalPaidForMonth: 0,
            totalPaidAllTime: totalPaidAllTime,
            totalSettled: 0, // Consistent with other branches
            rentTillNow: 0,
            hasSettlements: false, // Consistent with other branches
            isProrated: false,
            dueStatus: "N/A",
          };
        }
      })
    );

    // Calculate summary statistics
    const summary = enhancedUsers.reduce(
      (acc: any, user: any) => {
        if (user.currentMonthRentStatus === "Paid") {
          acc.paidCount++;
        } else if (
          user.currentMonthRentStatus === "Unpaid" &&
          user.dueAmount > 0 // Use actual due amount (after settlements)
        ) {
          acc.unpaidCount++;
          acc.totalUnpaidAmount += user.dueAmount; // Use actual due amount
          acc.currentMonthDue += user.currentMonthDue;
          acc.previousUnpaidDue += user.previousUnpaidDue;
        } else if (
          user.currentMonthRentStatus === "Partial" &&
          user.dueAmount > 0 // Handle partial payments/settlements
        ) {
          acc.unpaidCount++;
          acc.totalUnpaidAmount += user.dueAmount; // Use remaining due amount
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
