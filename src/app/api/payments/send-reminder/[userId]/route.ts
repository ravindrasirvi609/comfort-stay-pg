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

    // Get the user details
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Find the most recent unpaid payment for this user
    const unpaidPayment = await Payment.findOne({
      userId,
      status: { $in: ["Due", "Overdue"] },
      isActive: true,
    }).sort({ dueDate: -1 });

    if (!unpaidPayment) {
      return NextResponse.json(
        {
          success: false,
          message: "No unpaid dues found for this user",
        },
        { status: 404 }
      );
    }

    // Get the current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    // Send email reminder
    try {
      await sendEmail({
        to: userDetails.email,
        subject: `Urgent: Rent Payment Reminder`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d53f8c;">Rent Payment Reminder</h2>
            <p>Dear ${userDetails.name},</p>
            <p>This is a reminder that you have unpaid rent dues.</p>
            <div style="background-color: #f8f4ff; border-left: 4px solid #d53f8c; padding: 15px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Amount Due:</strong> ₹${unpaidPayment.amount}</p>
              <p style="margin: 10px 0 0;"><strong>Due Date:</strong> ${
                unpaidPayment.dueDate
                  ? new Date(unpaidPayment.dueDate).toLocaleDateString()
                  : "As soon as possible"
              }</p>
              <p style="margin: 10px 0 0;"><strong>Month:</strong> ${unpaidPayment.months ? unpaidPayment.months.join(", ") : currentMonth}</p>
            </div>
            <p>Please make the payment at your earliest convenience to avoid any late fees or service disruptions.</p>
            <p>If you have already made the payment, please disregard this message.</p>
            <p>Thank you,<br>Comfort Stay PG Management</p>
          </div>
        `,
      });

      // Update payment record to indicate reminder was sent
      await Payment.findByIdAndUpdate(unpaidPayment._id, {
        $set: { lastReminderSent: new Date() },
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
