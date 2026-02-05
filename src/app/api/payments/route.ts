import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import Payment from "../models/Payment";
import User from "../models/User";
import UserDue from "../models/UserDue";
import Room from "../models/Room";
import { generateReceiptNumber } from "@/app/utils/receiptNumberGenerator";
import CacheInvalidator from "@/app/lib/cacheInvalidator";

// Helper function to recalculate user dues after payment (ENHANCED VERSION)
async function recalculateUserDuesAfterPayment(
  userId: string,
  monthsArray: string[]
) {
  console.log(`🔄 Starting enhanced settlement for user ${userId}`);

  // Step 1: Get ALL active dues for the user, sorted chronologically
  const allUserDues = await UserDue.find({
    userId,
    isActive: true,
  }).sort({ year: 1, monthNumber: 1 }); // Critical: Sort chronologically

  if (allUserDues.length === 0) {
    console.log(`No dues found for user ${userId}`);
    return;
  }

  console.log(`📋 Found ${allUserDues.length} dues for user ${userId}`);

  // Step 2: Get ALL payments for this user (not just for specific months)
  const allPayments = await Payment.find({
    userId,
    paymentStatus: "Paid",
    isDepositPayment: false,
    isActive: true,
  });

  const totalPaidByUser = allPayments.reduce(
    (sum: number, payment: any) => sum + payment.amount,
    0
  );

  console.log(`💰 Total payments by user: ₹${totalPaidByUser}`);

  // Step 3: Allocate total payments to dues chronologically (CRITICAL FIX)
  let remainingPaymentToAllocate = totalPaidByUser;

  for (const due of allUserDues) {
    const monthYear = `${due.month} ${due.year}`;
    const currentMonthDue = due.proratedRent;

    console.log(`\n📅 Processing ${monthYear} - Due: ₹${currentMonthDue}`);

    if (remainingPaymentToAllocate <= 0) {
      // No more payment to allocate
      due.totalPaid = 0;
      due.remainingDue = currentMonthDue;
      due.dueStatus = "Unpaid";
      console.log(`   ❌ No payment remaining - Status: Unpaid`);
    } else {
      // Allocate payment to this due (up to the due amount)
      const paymentForThisDue = Math.min(
        remainingPaymentToAllocate,
        currentMonthDue
      );
      remainingPaymentToAllocate -= paymentForThisDue;

      due.totalPaid = paymentForThisDue;
      due.remainingDue = Math.max(0, currentMonthDue - paymentForThisDue);
      due.currentMonthDue = currentMonthDue;
      due.totalDue = currentMonthDue; // Simplified - no previous unpaid in this logic
      due.previousUnpaidDue = 0; // Will be calculated if needed

      // Update status based on payment
      if (due.remainingDue === 0) {
        due.dueStatus = "Paid";
        console.log(`   ✅ Fully paid - Status: Paid`);
      } else if (paymentForThisDue > 0) {
        due.dueStatus = "Partial";
        console.log(
          `   🔄 Partially paid - Status: Partial, Remaining: ₹${due.remainingDue}`
        );
      } else {
        due.dueStatus = "Unpaid";
        console.log(`   ❌ Not paid - Status: Unpaid`);
      }
    }

    // Update the due record
    due.updatedAt = new Date();
    await due.save();

    console.log(
      `   💾 Updated ${monthYear}: Paid=₹${due.totalPaid}, Remaining=₹${due.remainingDue}, Status=${due.dueStatus}`
    );
  }

  console.log(`\n✅ Enhanced settlement complete for user ${userId}`);

  // Step 5: Log final summary
  const totalOutstanding = allUserDues.reduce(
    (sum, due) => sum + due.remainingDue,
    0
  );
  console.log(`📊 Total outstanding after settlement: ₹${totalOutstanding}`);
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
      let limit = parseInt(url.searchParams.get("limit") || "10");
      if (limit === 0) limit = 100000; // Return all if limit=0

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
            $lookup: {
              from: "rooms",
              localField: "userInfo.roomId",
              foreignField: "_id",
              as: "roomInfo",
            },
          },
          {
            $unwind: {
              path: "$roomInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              $or: [
                { "userInfo.name": { $regex: search, $options: "i" } },
                { "userInfo.pgId": { $regex: search, $options: "i" } },
                { receiptNumber: { $regex: search, $options: "i" } },
                { "roomInfo.roomNumber": { $regex: search, $options: "i" } },
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
            $lookup: {
              from: "rooms",
              localField: "userInfo.roomId",
              foreignField: "_id",
              as: "roomInfo",
            },
          },
          {
            $unwind: {
              path: "$roomInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              $or: [
                { "userInfo.name": { $regex: search, $options: "i" } },
                { "userInfo.pgId": { $regex: search, $options: "i" } },
                { receiptNumber: { $regex: search, $options: "i" } },
                { "roomInfo.roomNumber": { $regex: search, $options: "i" } },
              ],
            },
          },
          { $sort: { paymentDate: -1, createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              userId: {
                _id: "$userInfo._id",
                name: "$userInfo.name",
                email: "$userInfo.email",
                pgId: "$userInfo.pgId",
                roomId: "$roomInfo",
              },
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
          .populate({
            path: "userId",
            select: "name email pgId roomId",
            populate: {
              path: "roomId",
              select: "roomNumber",
              model: Room,
            },
          })
          .sort({ paymentDate: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit);
      }

      // Calculate statistics for the entire filtered set (not just current page)
      let stats = {
        totalPaidAmount: 0,
        pendingPaymentsCount: 0,
        thisMonthPaidAmount: 0,
      };

      const currentMonthYear = new Date().toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (search) {
        // Use aggregation to get stats when search is applied
        const statsPipeline = [
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
            $lookup: {
              from: "rooms",
              localField: "userInfo.roomId",
              foreignField: "_id",
              as: "roomInfo",
            },
          },
          {
            $unwind: {
              path: "$roomInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              $or: [
                { "userInfo.name": { $regex: search, $options: "i" } },
                { "userInfo.pgId": { $regex: search, $options: "i" } },
                { receiptNumber: { $regex: search, $options: "i" } },
                { "roomInfo.roomNumber": { $regex: search, $options: "i" } },
              ],
            },
          },
          {
            $group: {
              _id: null,
              totalPaidAmount: {
                $sum: {
                  $cond: [
                    { $eq: ["$paymentStatus", "Paid"] },
                    "$amount",
                    0
                  ]
                }
              },
              pendingPaymentsCount: {
                $sum: {
                  $cond: [
                    { $in: ["$paymentStatus", ["Due", "Overdue"]] },
                    1,
                    0
                  ]
                }
              },
              thisMonthPaidAmount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$paymentStatus", "Paid"] },
                        { $in: [currentMonthYear, { $ifNull: ["$months", []] }] }
                      ]
                    },
                    "$amount",
                    0
                  ]
                }
              }
            }
          }
        ];

        const statsResult = await Payment.aggregate(statsPipeline);
        if (statsResult.length > 0) {
          stats = {
            totalPaidAmount: statsResult[0].totalPaidAmount,
            pendingPaymentsCount: statsResult[0].pendingPaymentsCount,
            thisMonthPaidAmount: statsResult[0].thisMonthPaidAmount,
          };
        }
      } else {
        // Use simple aggregation when no search is applied
        const statsResult = await Payment.aggregate([
          { $match: query },
          {
            $group: {
              _id: null,
              totalPaidAmount: {
                $sum: {
                  $cond: [
                    { $eq: ["$paymentStatus", "Paid"] },
                    "$amount",
                    0
                  ]
                }
              },
              pendingPaymentsCount: {
                $sum: {
                  $cond: [
                    { $in: ["$paymentStatus", ["Due", "Overdue"]] },
                    1,
                    0
                  ]
                }
              },
              thisMonthPaidAmount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$paymentStatus", "Paid"] },
                        { $in: [currentMonthYear, { $ifNull: ["$months", []] }] }
                      ]
                    },
                    "$amount",
                    0
                  ]
                }
              }
            }
          }
        ]);

        if (statsResult.length > 0) {
          stats = {
            totalPaidAmount: statsResult[0].totalPaidAmount,
            pendingPaymentsCount: statsResult[0].pendingPaymentsCount,
            thisMonthPaidAmount: statsResult[0].thisMonthPaidAmount,
          };
        }
      }

      // Add pagination metadata to response
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Make sure virtuals are included
      const paymentsWithVirtuals = payments.map((payment: any) => {
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
        stats,
      });
    } else {
      // For normal users, only get their payments with pagination
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get("page") || "1");
      let limit = parseInt(url.searchParams.get("limit") || "10");
      if (limit === 0) limit = 100000; // Return all if limit=0
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
