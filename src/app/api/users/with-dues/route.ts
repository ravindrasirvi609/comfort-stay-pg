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

    // Get ALL dues for all users (not just current month) to calculate total outstanding
    const userIds = users.map((user: any) => user._id);
    const allDues = await UserDue.find({
      userId: { $in: userIds },
      isActive: true,
    }).lean();

    // Get current month dues specifically
    const currentMonthDues = await UserDue.find({
      userId: { $in: userIds },
      year: targetYear,
      monthNumber: targetMonth,
      isActive: true,
    }).lean();

    // Get all due settlements for all users
    const dueSettlements = await DueSettlement.find({
      userId: { $in: userIds },
      isActive: true,
    }).lean();

    // Create maps for quick lookup
    const allDuesMap = new Map();
    const currentMonthDuesMap = new Map();
    const settlementsMap = new Map();

    // Group all dues by user
    allDues.forEach((due: any) => {
      const userId = due.userId.toString();
      if (!allDuesMap.has(userId)) {
        allDuesMap.set(userId, []);
      }
      allDuesMap.get(userId).push(due);
    });

    // Map current month dues
    currentMonthDues.forEach((due: any) => {
      currentMonthDuesMap.set(due.userId.toString(), due);
    });

    // Group settlements by user
    dueSettlements.forEach((settlement: any) => {
      const userId = settlement.userId.toString();
      if (!settlementsMap.has(userId)) {
        settlementsMap.set(userId, []);
      }
      settlementsMap.get(userId).push(settlement);
    });

    // Calculate total payment data for each user (for display purposes only)
    const allUserPayments = await Payment.find({
      userId: { $in: userIds },
      paymentStatus: "Paid",
      isDepositPayment: false,
      isActive: true,
    }).lean();

    // Create payment map for all users (for total paid display)
    const allPaymentsMap = new Map();
    allUserPayments.forEach((payment: any) => {
      const userId = payment.userId.toString();
      const existing = allPaymentsMap.get(userId) || 0;
      allPaymentsMap.set(userId, existing + payment.amount);
    });

    // Enhanced user data using corrected UserDue records
    const enhancedUsers = users.map((user: any) => {
      const userId = user._id.toString();
      const userDues = allDuesMap.get(userId) || [];
      const currentMonthDue = currentMonthDuesMap.get(userId);
      const userSettlements = settlementsMap.get(userId) || [];
      const roomPrice = user.roomId?.price || 0;
      const moveInDate = user.moveInDate ? new Date(user.moveInDate) : null;
      const totalPaidAllTime = allPaymentsMap.get(userId) || 0;

      // Step 1: Calculate "Rent Till Now" - cumulative rent from check-in to current month
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

      // Step 2: Get total dues from database (UserDue records)
      const totalOutstandingFromDues = userDues.reduce(
        (sum: number, due: any) => sum + (due.remainingDue || 0),
        0
      );

      // Calculate total due amount (before payments)
      const totalDueAmount = userDues.reduce(
        (sum: number, due: any) =>
          sum + (due.proratedRent || due.currentMonthDue || 0),
        0
      );

      // Calculate total paid across all dues
      const totalPaidFromDues = userDues.reduce(
        (sum: number, due: any) => sum + (due.totalPaid || 0),
        0
      );

      // Step 3: Apply Settlements
      const totalSettlementAmount = userSettlements.reduce(
        (sum: number, settlement: any) => sum + (settlement.amount || 0),
        0
      );

      // Step 4: Calculate Final Actual Due
      // Final Actual Due = RentTillNow - (TotalPaid + Settlement)
      const actualDueAmount = Math.max(
        0,
        rentTillNow - (totalPaidAllTime + totalSettlementAmount)
      );

      // Determine overall due status based on actual calculations
      let overallDueStatus: "Paid" | "Partial" | "Unpaid" | "N/A" = "N/A";

      if (rentTillNow > 0) {
        if (actualDueAmount === 0) {
          overallDueStatus = "Paid";
        } else if (totalPaidAllTime > 0 || totalSettlementAmount > 0) {
          overallDueStatus = "Partial";
        } else {
          overallDueStatus = "Unpaid";
        }
      }

      // Current month specific data
      const currentMonthOutstanding = currentMonthDue?.remainingDue || 0;
      const currentMonthDueAmount =
        currentMonthDue?.proratedRent || currentMonthDue?.currentMonthDue || 0;
      const currentMonthPaid = currentMonthDue?.totalPaid || 0;
      const currentMonthStatus = currentMonthDue?.dueStatus || "N/A";

      if (userDues.length > 0) {
        // User has due records - use corrected data with settlements applied
        return {
          ...user,
          keyIssued: user.keyIssued || false, // Explicitly include
          depositReturn: user.depositReturn || null, // Explicitly include
          currentMonthRentStatus: currentMonthStatus,
          dueAmount: actualDueAmount, // Final Actual Due after settlements
          totalDue: rentTillNow, // Total rent till now
          currentMonthDue: currentMonthDueAmount,
          currentMonthOutstanding: currentMonthOutstanding,
          previousUnpaidDue: Math.max(
            0,
            actualDueAmount - currentMonthOutstanding
          ),
          totalPaidForMonth: currentMonthPaid,
          totalPaidAllTime,
          totalPaidFromDues, // Payment allocation from our fix
          totalSettlementAmount, // Total settlements applied
          rentTillNow,
          hasCorrectAllocations: true, // Flag to indicate corrected data
          hasSettlementsApplied: totalSettlementAmount > 0, // Flag for settlements
          isProrated: currentMonthDue?.isProrated || false,
          daysCovered: currentMonthDue?.daysCovered,
          totalDaysInMonth: currentMonthDue?.totalDaysInMonth,
          checkInDate: currentMonthDue?.checkInDate,
          proratedRent: currentMonthDue?.proratedRent,
          fullMonthRent: currentMonthDue?.fullMonthRent || roomPrice,
          dueStatus: overallDueStatus,
          dueDate: currentMonthDue?.dueDate,
          settlements: userSettlements.map((settlement: any) => ({
            month: settlement.month,
            amount: settlement.amount,
            reason: settlement.reason,
            remarks: settlement.remarks,
            settledAt: settlement.settledAt,
          })),
          duesBreakdown: userDues.map((due: any) => ({
            month: due.month,
            year: due.year,
            dueAmount: due.proratedRent || due.currentMonthDue || 0,
            paidAmount: due.totalPaid || 0,
            remainingAmount: due.remainingDue || 0,
            status: due.dueStatus,
            isProrated: due.isProrated,
          })),
        };
      } else if (roomPrice > 0) {
        // Legacy fallback for users without due records - apply settlements
        const actualStatus =
          actualDueAmount === 0
            ? "Paid"
            : totalPaidAllTime > 0 || totalSettlementAmount > 0
              ? "Partial"
              : "Unpaid";

        return {
          ...user,
          keyIssued: user.keyIssued || false, // Explicitly include
          depositReturn: user.depositReturn || null, // Explicitly include
          currentMonthRentStatus: actualStatus,
          dueAmount: actualDueAmount, // Final Actual Due after settlements
          totalDue: rentTillNow,
          currentMonthDue: roomPrice,
          currentMonthOutstanding: actualDueAmount,
          previousUnpaidDue: Math.max(0, rentTillNow - roomPrice),
          totalPaidForMonth: 0,
          totalPaidAllTime,
          totalPaidFromDues: 0,
          totalSettlementAmount, // Total settlements applied
          rentTillNow,
          hasCorrectAllocations: false, // Legacy calculation
          hasSettlementsApplied: totalSettlementAmount > 0, // Flag for settlements
          isProrated: false,
          proratedRent: roomPrice,
          fullMonthRent: roomPrice,
          dueStatus: actualStatus,
          settlements: userSettlements.map((settlement: any) => ({
            month: settlement.month,
            amount: settlement.amount,
            reason: settlement.reason,
            remarks: settlement.remarks,
            settledAt: settlement.settledAt,
          })),
          duesBreakdown: [],
        };
      } else {
        // No room assigned
        return {
          ...user,
          keyIssued: user.keyIssued || false, // Explicitly include
          depositReturn: user.depositReturn || null, // Explicitly include
          currentMonthRentStatus: "N/A",
          dueAmount: 0,
          totalDue: 0,
          currentMonthDue: 0,
          currentMonthOutstanding: 0,
          previousUnpaidDue: 0,
          totalPaidForMonth: 0,
          totalPaidAllTime: totalPaidAllTime,
          totalPaidFromDues: 0,
          totalSettlementAmount: 0,
          rentTillNow: 0,
          hasCorrectAllocations: false,
          hasSettlementsApplied: false,
          isProrated: false,
          dueStatus: "N/A",
          settlements: [],
          duesBreakdown: [],
        };
      }
    });

    // Calculate summary statistics using corrected data with settlements
    const summary = enhancedUsers.reduce(
      (acc: any, user: any) => {
        if (user.dueStatus === "Paid" || user.dueAmount === 0) {
          acc.paidCount++;
        } else if (user.dueAmount > 0) {
          acc.unpaidCount++;
          acc.totalUnpaidAmount += user.dueAmount; // Use Final Actual Due amount
          acc.currentMonthDue += user.currentMonthDue;
          acc.previousUnpaidDue += user.previousUnpaidDue;
        }

        // Add settlement summary
        if (user.hasSettlementsApplied) {
          acc.usersWithSettlements++;
          acc.totalSettlementAmount += user.totalSettlementAmount;
        }

        return acc;
      },
      {
        paidCount: 0,
        unpaidCount: 0,
        totalUnpaidAmount: 0,
        currentMonthDue: 0,
        previousUnpaidDue: 0,
        usersWithSettlements: 0,
        totalSettlementAmount: 0,
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
      usesCorrectAllocations: true, // Flag indicating updated calculation method
      usesSettlements: true, // Flag indicating settlements are applied
      calculationMethod: "RentTillNow - (TotalPaid + Settlements)", // Explanation of calculation
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
      usesCorrectAllocations: true, // Flag indicating updated calculation method
      usesSettlements: true, // Flag indicating settlements are applied
      calculationMethod: "RentTillNow - (TotalPaid + Settlements)", // Explanation of calculation
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
