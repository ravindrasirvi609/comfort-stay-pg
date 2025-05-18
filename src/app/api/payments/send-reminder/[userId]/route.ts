import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import Payment from "@/app/api/models/Payment";
import User from "@/app/api/models/User";
import { sendEmail } from "@/app/lib/email";

// POST /api/payments/send-reminder/[userId] - Send payment reminder to a specific user
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ userId: string }> }
) {
  const params = await props.params;
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

    const { userId } = params;

    // Get the user details with populated room data
    const userDetails = await User.findById(userId).populate("roomId");
    if (!userDetails) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Get current month and year in "Month YYYY" format
    const currentDate = new Date();
    const currentMonthYear = `${currentDate.toLocaleString("default", { month: "long" })} ${currentDate.getFullYear()}`;

    // Get user's room price
    const roomPrice =
      userDetails.roomId && typeof userDetails.roomId === "object"
        ? userDetails.roomId.price
        : 0;

    if (roomPrice === 0) {
      return NextResponse.json(
        { success: false, message: "User has no room assigned" },
        { status: 404 }
      );
    }

    // Find all payments for the current month
    const userPaymentsForCurrentMonth = await Payment.find({
      userId,
      months: { $in: [currentMonthYear] },
      isActive: true,
      isDepositPayment: false,
    });

    // Calculate total amount paid for current month
    let totalAmountPaidForCurrentMonth = 0;
    for (const payment of userPaymentsForCurrentMonth) {
      if (payment.paymentStatus === "Paid") {
        totalAmountPaidForCurrentMonth += payment.amount;
      }
    }

    // Calculate due amount
    const dueAmount = roomPrice - totalAmountPaidForCurrentMonth;

    if (dueAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "No unpaid dues found for this user" },
        { status: 404 }
      );
    }

    // Send email reminder
    try {
      await sendEmail({
        to: userDetails.email,
        subject: `Urgent: Rent Payment Reminder - ${currentMonthYear}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #d53f8c; margin: 0; font-size: 24px;">Comfort Stay PG</h1>
              <p style="color: #4a5568; margin: 5px 0;">Payment Reminder Notice</p>
            </div>

            <div style="background-color: #f8f4ff; border-left: 4px solid #d53f8c; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #2d3748; font-size: 16px;">Dear ${userDetails.name},</p>
              <p style="margin: 10px 0; color: #4a5568;">This is a formal reminder regarding your pending rent payment for ${currentMonthYear}.</p>
            </div>

            <div style="background-color: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 20px 0;">
              <h2 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px;">Payment Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #4a5568;">Room Price:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${roomPrice}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #4a5568;">Amount Paid:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${totalAmountPaidForCurrentMonth}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 12px 0; color: #2d3748; font-weight: bold;">Amount Due:</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #e53e3e;">₹${dueAmount}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 6px; padding: 20px; margin: 20px 0;">
              <h2 style="color: #c53030; margin: 0 0 15px 0; font-size: 18px;">Important Notice</h2>
              <p style="margin: 0; color: #4a5568; line-height: 1.6;">
                Please note that late fees will be applicable after 5 days from the due date. To avoid any additional charges, we kindly request you to clear your payment at the earliest.
              </p>
            </div>

            <div style="background-color: #f0fff4; border: 1px solid #c6f6d5; border-radius: 6px; padding: 20px; margin: 20px 0;">
              <h2 style="color: #2f855a; margin: 0 0 15px 0; font-size: 18px;">Payment Instructions</h2>
              <p style="margin: 0; color: #4a5568; line-height: 1.6;">
                You can make the payment through our payment gateway or visit the PG office.
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #4a5568; font-size: 14px;">If you have already made the payment, please disregard this message.</p>
              <p style="margin: 10px 0 0; color: #4a5568; font-size: 14px;">For any payment-related queries, please contact the PG office.</p>
            </div>

            <div style="margin-top: 30px; text-align: center; color: #718096; font-size: 14px;">
              <p style="margin: 0;">Thank you for your cooperation.</p>
              <p style="margin: 5px 0;">Comfort Stay PG Management</p>
            </div>
          </div>
        `,
      });

      // Create a new payment record for the reminder
      await Payment.create({
        userId,
        amount: dueAmount,
        months: [currentMonthYear],
        paymentStatus: "Due",
        isActive: true,
        isDepositPayment: false,
        remarks: "Payment reminder sent",
        lastReminderSent: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: "Payment reminder sent successfully",
      });
    } catch (emailError) {
      console.error("Error sending reminder email:", emailError);
      return NextResponse.json(
        { success: false, message: "Failed to send reminder email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Payment reminder error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
