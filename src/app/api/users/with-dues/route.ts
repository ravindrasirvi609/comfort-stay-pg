import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import User from "@/app/api/models/User";
import UserDue from "@/app/api/models/UserDue";
import Payment from "@/app/api/models/Payment";
import DueSettlement from "@/app/api/models/DueSettlement";

/** Escape special regex characters in a user-supplied search string */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/users/with-dues - Get users with enhanced due information
// Supports server-side filtering, search and pagination.
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

    // Filtering params
    const search = (searchParams.get("search") || "").trim();
    const paymentFilter = searchParams.get("paymentFilter") || ""; // "unpaid" | "no-dues" | ""
    const roomId = searchParams.get("roomId") || "";
    const state = searchParams.get("state") || "";
    const company = searchParams.get("company") || "";
    const city = searchParams.get("city") || "";
    const noticePeriod = searchParams.get("noticePeriod") || "";
    const vehicle = searchParams.get("vehicle") || "";

    // Pagination / export params
    const isExport = searchParams.get("export") === "true";
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "10", 10);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10;
    const skip = isExport ? 0 : (page - 1) * limit;

    await connectToDatabase();

    // ------------------------------------------------------------------
    // Build user query
    // ------------------------------------------------------------------
    let userQuery: any = {};
    if (status === "active") {
      userQuery.isActive = true;
    } else if (status === "inactive") {
      userQuery.isActive = false;
      userQuery.isDeleted = { $ne: true };
    } else if (status === "deleted") {
      userQuery.isDeleted = true;
    }
    // status === "all" -> no restriction

    // Direct-match filters
    if (state) {
      userQuery.state = state;
    }
    if (company) {
      // Substring, case-insensitive match on company name
      userQuery.companyName = new RegExp(escapeRegex(company), "i");
    }
    if (city) {
      userQuery.city = city;
    }
    if (noticePeriod === "true") {
      userQuery.isOnNoticePeriod = true;
    } else if (noticePeriod === "false") {
      userQuery.isOnNoticePeriod = { $ne: true };
    }
    if (vehicle === "true") {
      userQuery.vehicleNumber = { $exists: true, $ne: "" };
    } else if (vehicle === "false") {
      userQuery.$or = (userQuery.$or || []).concat([
        { vehicleNumber: { $exists: false } },
        { vehicleNumber: "" },
      ]);
    }
    if (roomId === "assigned") {
      userQuery.roomId = { $exists: true, $ne: null };
    } else if (roomId === "unassigned") {
      userQuery.$or = (userQuery.$or || []).concat([
        { roomId: { $exists: false } },
        { roomId: null },
      ]);
    } else if (roomId) {
      // A specific room's ObjectId. Guard against an invalid ObjectId
      // crashing the query - fall back to a filter that matches no
      // documents instead of throwing.
      userQuery.roomId = mongoose.Types.ObjectId.isValid(roomId)
        ? new mongoose.Types.ObjectId(roomId)
        : new mongoose.Types.ObjectId();
    }

    // Search across multiple fields - merge with existing query via $and so
    // it doesn't clobber the filters built above.
    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");
      const searchOr = {
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { pgId: searchRegex },
          { companyName: searchRegex },
          { vehicleNumber: searchRegex },
        ],
      };
      userQuery = { $and: [searchOr, userQuery] };
    }

    // Payment filter - pre-resolve the set of matching user ids from UserDue
    // before running the main paginated User query.
    if (paymentFilter === "unpaid") {
      const unpaidDues = await UserDue.find(
        { isActive: true, remainingDue: { $gt: 0 } },
        "userId"
      ).lean();
      const usersWithDues = Array.from(
        new Set(unpaidDues.map((d: any) => d.userId.toString()))
      ).map((id) => new mongoose.Types.ObjectId(id));
      userQuery._id = { $in: usersWithDues };
    } else if (paymentFilter === "no-dues") {
      const anyDues = await UserDue.find({ isActive: true }, "userId").lean();
      const usersWithDues = Array.from(
        new Set(anyDues.map((d: any) => d.userId.toString()))
      ).map((id) => new mongoose.Types.ObjectId(id));
      userQuery._id = { $nin: usersWithDues };
    }

    // Get current month/year or use provided
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // ------------------------------------------------------------------
    // Run the paginated query + total count + the full matching id list
    // (the id list is lightweight - projected to _id only - and is used
    // purely to compute summary stats across ALL matching users below).
    // ------------------------------------------------------------------
    const [totalCount, pagedUsers, allMatchingUsers] = await Promise.all([
      User.countDocuments(userQuery),
      User.find(userQuery)
        .populate("roomId", "roomNumber type price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(isExport ? 0 : limit)
        .lean(),
      User.find(userQuery, "_id").lean(),
    ]);

    const pageUserIds = pagedUsers.map((u: any) => u._id);
    const allMatchingUserIds = allMatchingUsers.map((u: any) => u._id);

    // ------------------------------------------------------------------
    // Fetch dues/payments/settlements data ONLY for the current page's
    // users - this is what makes the per-user enrichment below cheap
    // regardless of how many users match the overall filter.
    // ------------------------------------------------------------------
    const [allDues, currentMonthDues, dueSettlements, allUserPayments] =
      await Promise.all([
        UserDue.find({
          userId: { $in: pageUserIds },
          isActive: true,
        }).lean(),
        UserDue.find({
          userId: { $in: pageUserIds },
          year: targetYear,
          monthNumber: targetMonth,
          isActive: true,
        }).lean(),
        DueSettlement.find({
          userId: { $in: pageUserIds },
          isActive: true,
        }).lean(),
        Payment.find({
          userId: { $in: pageUserIds },
          paymentStatus: "Paid",
          isDepositPayment: false,
          isActive: true,
        }).lean(),
      ]);

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

    // Create payment map for all users (for total paid display)
    const allPaymentsMap = new Map();
    allUserPayments.forEach((payment: any) => {
      const userId = payment.userId.toString();
      const existing = allPaymentsMap.get(userId) || 0;
      allPaymentsMap.set(userId, existing + payment.amount);
    });

    // Enhanced user data using corrected UserDue records - only for the
    // current page.
    const enhancedUsers = pagedUsers.map((user: any) => {
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

    // ------------------------------------------------------------------
    // Summary stats - must reflect ALL matching users, not just the
    // current page, so these are computed via lightweight aggregations
    // over allMatchingUserIds rather than by reducing enhancedUsers.
    // ------------------------------------------------------------------
    const [overallAgg, currentMonthAgg, settlementAgg] = await Promise.all([
      // Net outstanding balance per user (summed across their active due
      // records first, so a user with multiple months' worth of UserDue
      // rows is only counted once for unpaidCount).
      UserDue.aggregate([
        { $match: { userId: { $in: allMatchingUserIds }, isActive: true } },
        { $group: { _id: "$userId", remainingDue: { $sum: "$remainingDue" } } },
        {
          $group: {
            _id: null,
            totalUnpaidAmount: { $sum: "$remainingDue" },
            unpaidCount: {
              $sum: { $cond: [{ $gt: ["$remainingDue", 0] }, 1, 0] },
            },
          },
        },
      ]),
      // Current-month due figures, straight off the stored UserDue fields
      // for the target month - no per-user recomputation needed.
      UserDue.aggregate([
        {
          $match: {
            userId: { $in: allMatchingUserIds },
            year: targetYear,
            monthNumber: targetMonth,
            isActive: true,
          },
        },
        {
          $group: {
            _id: null,
            currentMonthDue: { $sum: "$currentMonthDue" },
            previousUnpaidDue: { $sum: "$previousUnpaidDue" },
          },
        },
      ]),
      // Settlement totals across matching users.
      DueSettlement.aggregate([
        { $match: { userId: { $in: allMatchingUserIds }, isActive: true } },
        { $group: { _id: "$userId", settlementTotal: { $sum: "$amount" } } },
        {
          $group: {
            _id: null,
            usersWithSettlements: { $sum: 1 },
            totalSettlementAmount: { $sum: "$settlementTotal" },
          },
        },
      ]),
    ]);

    const summaryData = overallAgg[0] || {
      totalUnpaidAmount: 0,
      unpaidCount: 0,
    };
    const currentMonthSummary = currentMonthAgg[0] || {
      currentMonthDue: 0,
      previousUnpaidDue: 0,
    };
    const settlementSummary = settlementAgg[0] || {
      usersWithSettlements: 0,
      totalSettlementAmount: 0,
    };

    const summary = {
      totalUsers: totalCount,
      paidCount: Math.max(0, totalCount - summaryData.unpaidCount),
      unpaidCount: summaryData.unpaidCount,
      totalUnpaidAmount: summaryData.totalUnpaidAmount,
      currentMonthDue: currentMonthSummary.currentMonthDue,
      previousUnpaidDue: currentMonthSummary.previousUnpaidDue,
      usersWithSettlements: settlementSummary.usersWithSettlements,
      totalSettlementAmount: settlementSummary.totalSettlementAmount,
    };

    return NextResponse.json({
      success: true,
      users: enhancedUsers,
      summary,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      targetMonth,
      targetYear,
      targetMonthName: new Date(targetYear, targetMonth - 1).toLocaleString(
        "default",
        { month: "long" }
      ),
      usesCorrectAllocations: true, // Flag indicating updated calculation method
      usesSettlements: true, // Flag indicating settlements are applied
      calculationMethod: "server-paginated", // Explanation of calculation
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
