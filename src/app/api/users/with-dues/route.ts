import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import User from "@/app/api/models/User";
import UserDue from "@/app/api/models/UserDue";
import Payment from "@/app/api/models/Payment";
import DueSettlement from "@/app/api/models/DueSettlement";
import duesToCache from "@/app/lib/cache";

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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "active";
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Generate cache key based on query parameters
    const cacheKey = duesToCache.generateKey("users-with-dues", {
      status,
      month: month || "current",
      year: year || "current",
    });

    // Check if data exists in cache
    const cachedData = duesToCache.get(cacheKey);
    if (cachedData) {
      console.log(`[CACHE HIT] users-with-dues: ${cacheKey}`);
      return NextResponse.json({
        ...cachedData,
        cached: true,
        cacheHit: true,
      });
    }

    console.log(`[CACHE MISS] users-with-dues: ${cacheKey}`);

    await connectToDatabase();

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

    // OPTIMIZED: Pre-fetch all settlements and current month payments in batch
    const currentMonthYear = `${new Date(targetYear, targetMonth - 1).toLocaleString("default", { month: "long" })} ${targetYear}`;

    // Batch fetch all settlements for current month
    const allSettlements = await DueSettlement.find({
      userId: { $in: userIds },
      month: currentMonthYear,
      isActive: true,
    }).lean();

    // Create settlements map
    const settlementsMap = new Map();
    allSettlements.forEach((settlement: any) => {
      const userId = settlement.userId.toString();
      const existing = settlementsMap.get(userId) || 0;
      settlementsMap.set(userId, existing + settlement.amount);
    });

    // Batch fetch current month payments for all users
    const currentMonthPayments = await Payment.find({
      userId: { $in: userIds },
      months: currentMonthYear,
      paymentStatus: "Paid",
      isDepositPayment: false,
      isActive: true,
    }).lean();

    // Create current month payments map
    const currentMonthPaymentsMap = new Map();
    currentMonthPayments.forEach((payment: any) => {
      const userId = payment.userId.toString();
      const existing = currentMonthPaymentsMap.get(userId) || 0;
      currentMonthPaymentsMap.set(userId, existing + payment.amount);
    });

    // Enhanced user data (optimized without individual queries)
    const enhancedUsers = users.map((user: any) => {
      const due = duesMap.get(user._id.toString());
      const roomPrice = user.roomId?.price || 0;
      const moveInDate = user.moveInDate ? new Date(user.moveInDate) : null;
      const currentDate = new Date(targetYear, targetMonth - 1);

      // Calculate total paid across all months
      const totalPaidAllTime = allPaymentsMap.get(user._id.toString()) || 0;
      const totalSettled = settlementsMap.get(user._id.toString()) || 0;
      const totalPaidForMonth =
        currentMonthPaymentsMap.get(user._id.toString()) || 0;

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
        const totalDue =
          (due.currentMonthDue || 0) + (due.previousUnpaidDue || 0);
        const effectiveDue = Math.max(
          0,
          totalDue - totalPaidForMonth - totalSettled
        );

        let dueStatus: "Paid" | "Partial" | "Unpaid";
        if (effectiveDue === 0) {
          dueStatus = "Paid";
        } else if (totalPaidForMonth > 0 || totalSettled > 0) {
          dueStatus = "Partial";
        } else {
          dueStatus = "Unpaid";
        }

        return {
          ...user,
          currentMonthRentStatus: dueStatus,
          dueAmount: effectiveDue,
          totalDue: totalDue,
          currentMonthDue: due.currentMonthDue || 0,
          previousUnpaidDue: due.previousUnpaidDue || 0,
          totalPaidForMonth: totalPaidForMonth,
          totalPaidAllTime,
          totalSettled: totalSettled,
          rentTillNow,
          hasSettlements: totalSettled > 0,
          isProrated: due.isProrated || false,
          daysCovered: due.daysCovered,
          totalDaysInMonth: due.totalDaysInMonth,
          checkInDate: due.checkInDate,
          proratedRent: due.proratedRent,
          fullMonthRent: due.fullMonthRent,
          dueStatus: dueStatus,
          dueDate: due.dueDate,
        };
      } else if (roomPrice > 0) {
        // Legacy calculation for users without due records
        const actualDueAmount = Math.max(
          0,
          rentTillNow - totalPaidAllTime - totalSettled
        );
        const actualStatus =
          actualDueAmount === 0
            ? "Paid"
            : totalPaidAllTime > 0 || totalSettled > 0
              ? "Partial"
              : "Unpaid";

        return {
          ...user,
          currentMonthRentStatus: actualStatus,
          dueAmount: actualDueAmount,
          totalDue: rentTillNow,
          currentMonthDue: roomPrice,
          previousUnpaidDue: Math.max(0, rentTillNow - roomPrice),
          totalPaidForMonth: totalPaidForMonth,
          totalPaidAllTime,
          totalSettled: totalSettled,
          rentTillNow,
          hasSettlements: totalSettled > 0,
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
          totalSettled: 0,
          rentTillNow: 0,
          hasSettlements: false,
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
      cached: false,
      cacheHit: false,
    });

    // Cache the result for future requests (5 minutes TTL)
    const responseData = {
      success: true,
      users: enhancedUsers,
      summary,
      targetMonth,
      targetYear,
      targetMonthName: new Date(targetYear, targetMonth - 1).toLocaleString(
        "default",
        { month: "long" }
      ),
    };

    duesToCache.set(cacheKey, responseData, 5 * 60 * 1000); // 5 minutes cache
    console.log(`[CACHE SET] users-with-dues: ${cacheKey}`);

    return NextResponse.json({
      ...responseData,
      cached: false,
      cacheHit: false,
    });
  } catch (error) {
    console.error("Error fetching users with dues:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
