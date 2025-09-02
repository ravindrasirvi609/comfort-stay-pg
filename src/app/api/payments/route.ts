import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import Payment from "../models/Payment";
import User from "../models/User";
import UserDue from "../models/UserDue";
import { generateReceiptNumber } from "@/app/utils/receiptNumberGenerator";
import { calculateTotalDue } from "@/app/utils/proratedRentCalculation";
import CacheInvalidator from "@/app/lib/cacheInvalidator";

// Helper function to recalculate user dues after payment
async function recalculateUserDuesAfterPayment(
  userId: string,
  monthsArray: string[]
) {
  for (const monthYear of monthsArray) {
    // Parse month and year from "January 2025" format
    const [monthName, yearStr] = monthYear.split(" ");
    const year = parseInt(yearStr);
    const monthNumber = new Date(`${monthName} 1, ${year}`).getMonth() + 1;

    // Find the due record for this month
    const due = await UserDue.findOne({
      userId,
      year,
      monthNumber,
      isActive: true,
    });

    if (!due) {
      // If no due record exists, skip this month
      console.log(`No due record found for user ${userId}, month ${monthYear}`);
      continue;
    }

    // Get all payments for this month
    const payments = await Payment.find({
      userId,
      months: monthYear,
      paymentStatus: "Paid",
      isDepositPayment: false,
      isActive: true,
    });

    const totalPaid = payments.reduce(
      (sum: number, payment: any) => sum + payment.amount,
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
      (sum: number, prevDue: any) => sum + prevDue.remainingDue,
      0
    );

    // Calculate updated due amounts
    const dueCalc = calculateTotalDue(
      due.proratedRent,
      previousUnpaidDue,
      totalPaid
    );

    // Update the due record
    due.totalDue = dueCalc.totalDue;
    due.currentMonthDue = dueCalc.currentMonthDue;
    due.previousUnpaidDue = dueCalc.previousUnpaidDue;
    due.totalPaid = dueCalc.totalPaid;
    due.remainingDue = dueCalc.remainingDue;
    due.dueStatus = dueCalc.dueStatus;
    due.updatedAt = new Date();

    await due.save();

    // Also update future months that might be affected
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
        (sum: number, payment: any) => sum + payment.amount,
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
        (sum: number, prevDue: any) => sum + prevDue.remainingDue,
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
  }
}

// Get all payments
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    let payments;

    // If admin, get all payments
    if (isAdmin(user)) {
      // Get URL parameters
      const url = new URL(request.url);
      const userId = url.searchParams.get("userId");
      const status = url.searchParams.get("status");
      const month = url.searchParams.get("month");
      const year = url.searchParams.get("year");
      const search = url.searchParams.get("search");
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "10");

      // Build query based on parameters
      const query: Record<string, any> = {
        isActive: true,
      };
      if (userId) query.userId = userId;
      if (status) query.paymentStatus = status;

      // Handle month filter by checking if it exists in the months array
      if (month && year) {
        const monthYear = `${month} ${year}`;
        query.months = { $in: [monthYear] };
      } else if (month) {
        // If only month is provided, search for any year with that month
        query.months = { $regex: new RegExp(`^${month} `, "i") };
      } else if (year) {
        // If only year is provided, search for any month with that year
        query.months = { $regex: new RegExp(` ${year}$`, "i") };
      }

      // Calculate skip value for pagination
      const skip = (page - 1) * limit;

      // First, get total count for pagination metadata
      let totalCount;
      if (search) {
        // If search is provided, we need to aggregate with user data
        const searchPipeline = [
          { $match: query },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userInfo",
            },
          },
          { $unwind: "$userInfo" },
          {
            $match: {
              $or: [
                { "userInfo.name": { $regex: search, $options: "i" } },
                { "userInfo.pgId": { $regex: search, $options: "i" } },
                { receiptNumber: { $regex: search, $options: "i" } },
              ],
            },
          },
          { $count: "total" },
        ] as any[];

        const countResult = await Payment.aggregate(searchPipeline);
        totalCount = countResult.length > 0 ? countResult[0].total : 0;
      } else {
        totalCount = await Payment.countDocuments(query);
      }

      // Now get the actual payments with pagination
      if (search) {
        // Use aggregation for search functionality
        const searchPipeline = [
          { $match: query },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userInfo",
            },
          },
          { $unwind: "$userInfo" },
          {
            $match: {
              $or: [
                { "userInfo.name": { $regex: search, $options: "i" } },
                { "userInfo.pgId": { $regex: search, $options: "i" } },
                { receiptNumber: { $regex: search, $options: "i" } },
              ],
            },
          },
          { $sort: { paymentDate: -1, createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              userId: "$userInfo",
              amount: 1,
              months: 1,
              paymentStatus: 1,
              paymentDate: 1,
              receiptNumber: 1,
              paymentMethod: 1,
              remarks: 1,
              createdAt: 1,
              isDepositPayment: 1,
              isActive: 1,
            },
          },
        ] as any[];

        payments = await Payment.aggregate(searchPipeline);
      } else {
        payments = await Payment.find(query)
          .populate("userId", "name email pgId")
          .sort({ paymentDate: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit);
      }

      // Add pagination metadata to response
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Make sure virtuals are included
      const paymentsWithVirtuals = payments.map((payment) => {
        const paymentObj =
          typeof payment.toObject === "function"
            ? payment.toObject({ virtuals: true })
            : { ...payment }; // For aggregation results

        // Ensure month is set if it doesn't exist but months does
        if (
          !paymentObj.month &&
          paymentObj.months &&
          paymentObj.months.length > 0
        ) {
          paymentObj.month = paymentObj.months[0];
        }
        return paymentObj;
      });

      return NextResponse.json({
        success: true,
        payments: paymentsWithVirtuals,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit,
        },
      });
    } else {
      // For normal users, only get their payments with pagination
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "10");
      const skip = (page - 1) * limit;

      const userQuery = {
        userId: user._id,
        isActive: true,
      };

      const totalCount = await Payment.countDocuments(userQuery);
      const totalPages = Math.ceil(totalCount / limit);

      payments = await Payment.find(userQuery)
        .sort({ paymentDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Make sure virtuals are included
      const paymentsWithVirtuals = payments.map((payment) => {
        const paymentObj = payment.toObject({ virtuals: true });
        if (
          !paymentObj.month &&
          paymentObj.months &&
          paymentObj.months.length > 0
        ) {
          paymentObj.month = paymentObj.months[0];
        }
        return paymentObj;
      });

      return NextResponse.json({
        success: true,
        payments: paymentsWithVirtuals,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit,
        },
      });
    }
  } catch (error) {
    console.error("Get payments error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new payment (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Admin privileges required.",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const {
      userId,
      amount,
      months,
      paymentDate,
      dueDate,
      status,
      paymentStatus,
      remarks,
      paymentMethod,
      transactionId,
      isDepositPayment,
    } = await request.json();

    // Validate required fields
    if (!userId || !amount || !months || !dueDate) {
      return NextResponse.json(
        { success: false, message: "Please provide all required fields" },
        { status: 400 }
      );
    }

    // Log for debugging
    console.log("Received payment data:", {
      userId,
      amount,
      months,
      paymentStatus,
      status,
    });

    // Check if user exists
    const userExists = await User.findById(userId);

    if (!userExists) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Validate that user doesn't already have payments for the selected months
    const selectedMonths = Array.isArray(months) ? months : [months];

    // Check for existing payments for the same user and months (excluding deposit payments)
    const existingPayments = await Payment.find({
      userId,
      months: { $in: selectedMonths },
      isActive: true,
      isDepositPayment: false, // Exclude deposit payments from this validation
    });

    if (existingPayments.length > 0) {
      // Find which months already have payments
      const existingMonths = existingPayments.flatMap(
        (payment) => payment.months
      );
      const conflictingMonths = selectedMonths.filter((month) =>
        existingMonths.includes(month)
      );

      return NextResponse.json(
        {
          success: false,
          message: `Payment already exists for the following month(s): ${conflictingMonths.join(", ")}. Each user can only have one payment entry per month.`,
        },
        { status: 400 }
      );
    }

    // Generate sequential receipt number (C00001, C00002, etc.)
    const receiptNumber = await generateReceiptNumber();

    // Create new payment record
    // Note: paymentDate is always set to current timestamp when payment is created via admin
    // This ensures the payment date reflects when the record was created, not a selected date
    const newPayment = new Payment({
      userId,
      amount,
      months: Array.isArray(months) ? months : [months], // Ensure months is an array
      paymentDate: new Date(), // Always use current timestamp when payment is created
      dueDate,
      paymentStatus: paymentStatus || status || "Paid", // Use paymentStatus field if provided, otherwise use status
      receiptNumber,
      paymentMethod,
      transactionId,
      remarks,
      isDepositPayment: isDepositPayment || false,
    });

    // Log the payment record before saving
    console.log("Saving payment with data:", {
      months: newPayment.months,
      paymentStatus: newPayment.paymentStatus,
      receiptNumber: newPayment.receiptNumber,
    });

    await newPayment.save();

    // Invalidate cache after payment creation
    CacheInvalidator.invalidateAllUserRelatedCache(userId);

    // If this is a deposit payment, update the user's depositFees field
    if (isDepositPayment) {
      await User.findByIdAndUpdate(userId, {
        depositFees: amount,
        $set: { registrationStatus: "Approved" }, // Auto-approve registration when deposit is paid
      });
    } else {
      // For regular payments, update user dues
      try {
        await recalculateUserDuesAfterPayment(userId, selectedMonths);
      } catch (dueError) {
        console.error("Error updating dues after payment:", dueError);
        // Don't fail the payment creation, but log the error
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment recorded successfully",
      payment: newPayment,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
