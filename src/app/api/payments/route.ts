import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import Payment from "@/app/api/models/Payment";
import User from "@/app/api/models/User";
import { generateReceiptNumber } from "@/app/utils/receiptNumberGenerator";

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

      // Build query based on parameters
      const query: Record<string, any> = { isActive: true };
      if (userId) query.userId = userId;
      if (status) query.paymentStatus = status;

      // Handle month filter by checking if it exists in the months array
      if (month) {
        query.months = { $in: [month] };
      }

      payments = await Payment.find(query)
        .populate("userId", "name email pgId")
        .sort({ paymentDate: -1 });
    } else {
      // For normal users, only get their payments
      payments = await Payment.find({
        userId: user._id,
        isActive: true,
      }).sort({ paymentDate: -1 });
    }

    // Make sure virtuals are included
    const paymentsWithVirtuals = payments.map((payment) => {
      const paymentObj = payment.toObject({ virtuals: true });
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
    });
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

    // Generate sequential receipt number (C00001, C00002, etc.)
    const receiptNumber = await generateReceiptNumber();

    // Create new payment record
    const newPayment = new Payment({
      userId,
      amount,
      months: Array.isArray(months) ? months : [months], // Ensure months is an array
      paymentDate: paymentDate || new Date(),
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

    // If this is a deposit payment, update the user's depositFees field
    if (isDepositPayment) {
      await User.findByIdAndUpdate(userId, {
        depositFees: amount,
        $set: { registrationStatus: "Approved" }, // Auto-approve registration when deposit is paid
      });
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
