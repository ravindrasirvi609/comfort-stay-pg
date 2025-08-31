import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import UserDue from "@/app/api/models/UserDue";
import User from "@/app/api/models/User";
import Payment from "@/app/api/models/Payment";
import {
  calculateProratedRent,
  calculateTotalDue,
  getMonthDetails,
  generateDueDate,
  getMonthsBetweenDates,
} from "@/app/utils/proratedRentCalculation";

// GET /api/user-dues - Get all user dues with filtering
export async function GET(request: NextRequest) {
  try {
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { isActive: true };

    if (userId) query.userId = userId;
    if (month) query.month = month;
    if (year) query.year = parseInt(year);
    if (status) query.dueStatus = status;

    // Non-admin users can only see their own dues
    if (!isAdmin(user)) {
      query.userId = user._id;
    }

    const totalDues = await UserDue.countDocuments(query);
    const dues = await UserDue.find(query)
      .populate("userId", "name email pgId phone roomId")
      .populate({
        path: "userId",
        populate: {
          path: "roomId",
          select: "roomNumber type price",
        },
      })
      .sort({ year: -1, monthNumber: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      dues,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalDues / limit),
        totalDues,
        hasNext: skip + dues.length < totalDues,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching user dues:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/user-dues - Create or update user dues (admin only)
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

    const {
      userId,
      month,
      year,
      monthNumber,
      forceRecalculate = false,
    } = await request.json();

    if (!userId || !month || !year || !monthNumber) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user with room details
    const userDoc = await User.findById(userId).populate("roomId");
    if (!userDoc || !userDoc.roomId) {
      return NextResponse.json(
        { success: false, message: "User not found or no room assigned" },
        { status: 404 }
      );
    }

    const room = userDoc.roomId as any;
    const fullMonthRent = room.price;
    const checkInDate = userDoc.moveInDate || userDoc.createdAt;

    // Check if due already exists
    const existingDue = await UserDue.findOne({
      userId,
      year,
      monthNumber,
      isActive: true,
    });

    if (existingDue && !forceRecalculate) {
      return NextResponse.json({
        success: true,
        message: "Due already exists",
        due: existingDue,
      });
    }

    // Calculate prorated rent
    const proratedCalc = calculateProratedRent(
      fullMonthRent,
      checkInDate,
      monthNumber,
      year
    );

    // Get previous month's unpaid dues
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
      (sum, due) => sum + due.remainingDue,
      0
    );

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

    // Calculate total due
    const dueCalc = calculateTotalDue(
      proratedCalc.proratedRent,
      previousUnpaidDue,
      totalPaid
    );

    const dueDate = generateDueDate(monthNumber, year);

    // Create or update due record
    const dueData = {
      userId,
      month,
      year,
      monthNumber,
      fullMonthRent,
      proratedRent: proratedCalc.proratedRent,
      daysCovered: proratedCalc.daysCovered,
      totalDaysInMonth: proratedCalc.totalDaysInMonth,
      totalDue: dueCalc.totalDue,
      currentMonthDue: dueCalc.currentMonthDue,
      previousUnpaidDue: dueCalc.previousUnpaidDue,
      totalPaid: dueCalc.totalPaid,
      remainingDue: dueCalc.remainingDue,
      dueStatus: dueCalc.dueStatus,
      dueDate,
      checkInDate: proratedCalc.isProrated ? checkInDate : undefined,
      isProrated: proratedCalc.isProrated,
      isActive: true,
    };

    let due;
    if (existingDue) {
      due = await UserDue.findByIdAndUpdate(existingDue._id, dueData, {
        new: true,
      });
    } else {
      due = new UserDue(dueData);
      await due.save();
    }

    return NextResponse.json({
      success: true,
      message: existingDue
        ? "Due updated successfully"
        : "Due created successfully",
      due,
    });
  } catch (error) {
    console.error("Error creating/updating user due:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/user-dues - Bulk generate dues for all active users (admin only)
export async function PUT(request: NextRequest) {
  try {
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const {
      targetMonth,
      targetYear,
      forceRecalculate = false,
    } = await request.json();

    if (!targetMonth || !targetYear) {
      return NextResponse.json(
        { success: false, message: "Target month and year required" },
        { status: 400 }
      );
    }

    // Get all active users with rooms
    const activeUsers = await User.find({
      isActive: true,
      roomId: { $exists: true, $ne: null },
    }).populate("roomId");

    const results = {
      success: 0,
      failed: 0,
      total: activeUsers.length,
      errors: [] as string[],
    };

    // Generate dues for each user
    for (const userDoc of activeUsers) {
      try {
        const userId = userDoc._id.toString();
        const room = userDoc.roomId as any;
        
        // Skip if room or room price is null/undefined
        if (!room || !room.price) {
          results.errors.push(`User ${userId}: No room price available`);
          results.failed++;
          continue;
        }
        
        const fullMonthRent = room.price;
        const checkInDate = userDoc.moveInDate || userDoc.createdAt;

        // Check if due already exists
        const existingDue = await UserDue.findOne({
          userId,
          year: targetYear,
          monthNumber: targetMonth,
          isActive: true,
        });

        if (existingDue && !forceRecalculate) {
          results.success++;
          continue;
        }

        // Calculate prorated rent
        const proratedCalc = calculateProratedRent(
          fullMonthRent,
          checkInDate,
          targetMonth,
          targetYear
        );

        // Get previous unpaid dues
        let previousUnpaidDue = 0;
        const previousMonthDues = await UserDue.find({
          userId,
          $or: [
            { year: { $lt: targetYear } },
            { year: targetYear, monthNumber: { $lt: targetMonth } },
          ],
          remainingDue: { $gt: 0 },
          isActive: true,
        });

        previousUnpaidDue = previousMonthDues.reduce(
          (sum, due) => sum + due.remainingDue,
          0
        );

        // Get payments for this month
        const monthName = new Date(targetYear, targetMonth - 1).toLocaleString(
          "default",
          { month: "long" }
        );
        const monthYear = `${monthName} ${targetYear}`;

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

        // Calculate total due
        const dueCalc = calculateTotalDue(
          proratedCalc.proratedRent,
          previousUnpaidDue,
          totalPaid
        );

        const dueDate = generateDueDate(targetMonth, targetYear);

        // Create or update due record
        const dueData = {
          userId,
          month: monthName,
          year: targetYear,
          monthNumber: targetMonth,
          fullMonthRent,
          proratedRent: proratedCalc.proratedRent,
          daysCovered: proratedCalc.daysCovered,
          totalDaysInMonth: proratedCalc.totalDaysInMonth,
          totalDue: dueCalc.totalDue,
          currentMonthDue: dueCalc.currentMonthDue,
          previousUnpaidDue: dueCalc.previousUnpaidDue,
          totalPaid: dueCalc.totalPaid,
          remainingDue: dueCalc.remainingDue,
          dueStatus: dueCalc.dueStatus,
          dueDate,
          checkInDate: proratedCalc.isProrated ? checkInDate : undefined,
          isProrated: proratedCalc.isProrated,
          isActive: true,
        };

        if (existingDue) {
          await UserDue.findByIdAndUpdate(existingDue._id, dueData);
        } else {
          const due = new UserDue(dueData);
          await due.save();
        }

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed for user ${userDoc.name}: ${error}`);
        console.error(`Error processing dues for user ${userDoc._id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk dues generation completed`,
      results,
    });
  } catch (error) {
    console.error("Error in bulk dues generation:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
