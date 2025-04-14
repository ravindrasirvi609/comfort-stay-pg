import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import Payment from "@/app/api/models/Payment";
import User from "@/app/api/models/User";
import { sendEmail } from "@/app/lib/email";

// POST /api/payments/reminder - Send reminders for unpaid dues
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

    const { userId, month } = await request.json();

    // If userId is provided, only send reminder to that specific user
    if (userId) {
      const userPayment = await Payment.findOne({
        userId,
        month,
        status: { $in: ["Due", "Overdue"] },
        isActive: true,
      });

      if (!userPayment) {
        return NextResponse.json(
          {
            success: false,
            message: "No due payment found for this user and month",
          },
          { status: 404 }
        );
      }

      // Get user details
      const userDetails = await User.findById(userId);
      if (!userDetails) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      // Send email reminder
      try {
        await sendEmail({
          to: userDetails.email,
          subject: `Rent Payment Reminder: ${month}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #d53f8c;">Rent Payment Reminder</h2>
              <p>Dear ${userDetails.name},</p>
              <p>This is a friendly reminder that your rent payment for <strong>${month}</strong> is currently due.</p>
              <div style="background-color: #f8f4ff; border-left: 4px solid #d53f8c; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Amount Due:</strong> ₹${userPayment.amount}</p>
                <p style="margin: 10px 0 0;"><strong>Due Date:</strong> ${userPayment.dueDate ? new Date(userPayment.dueDate).toLocaleDateString() : "As soon as possible"}</p>
              </div>
              <p>Please make the payment at your earliest convenience to avoid any late fees.</p>
              <p>If you have already made the payment, please disregard this message.</p>
              <p>Thank you,<br>Comfort Stay PG Management</p>
            </div>
          `,
        });

        // Update payment record to indicate reminder was sent
        await Payment.findByIdAndUpdate(userPayment._id, {
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
    } else {
      // Send reminders to all users with due payments for the specified month
      const duePayments = await Payment.find({
        month,
        status: { $in: ["Due", "Overdue"] },
        isActive: true,
      }).populate("userId", "name email");

      if (duePayments.length === 0) {
        return NextResponse.json(
          { success: false, message: "No due payments found for this month" },
          { status: 404 }
        );
      }

      const results = {
        success: 0,
        failed: 0,
        total: duePayments.length,
      };

      // Send reminders to each user
      for (const payment of duePayments) {
        try {
          const userDetails = payment.userId as { name: string; email: string };

          await sendEmail({
            to: userDetails.email,
            subject: `Rent Payment Reminder: ${month}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #d53f8c;">Rent Payment Reminder</h2>
                <p>Dear ${userDetails.name},</p>
                <p>This is a friendly reminder that your rent payment for <strong>${month}</strong> is currently due.</p>
                <div style="background-color: #f8f4ff; border-left: 4px solid #d53f8c; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Amount Due:</strong> ₹${payment.amount}</p>
                  <p style="margin: 10px 0 0;"><strong>Due Date:</strong> ${payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : "As soon as possible"}</p>
                </div>
                <p>Please make the payment at your earliest convenience to avoid any late fees.</p>
                <p>If you have already made the payment, please disregard this message.</p>
                <p>Thank you,<br>Comfort Stay PG Management</p>
              </div>
            `,
          });

          // Update payment record to indicate reminder was sent
          await Payment.findByIdAndUpdate(payment._id, {
            $set: { lastReminderSent: new Date() },
          });

          results.success++;
        } catch (emailError) {
          console.error("Error sending reminder email:", emailError);
          results.failed++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Sent ${results.success} reminders, failed to send ${results.failed} reminders`,
        results,
      });
    }
  } catch (error) {
    console.error("Payment reminder error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
