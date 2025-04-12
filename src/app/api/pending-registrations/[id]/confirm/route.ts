import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import { User, Payment } from "@/app/api/models";
import { sendEmail } from "@/app/lib/email";
import bcrypt from "bcryptjs";
import { generateRandomPassword } from "@/app/lib/utils";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get data from the request body
    const data = await request.json();
    const { allocatedRoomNo, checkInDate, paymentDetails } = data;

    if (!allocatedRoomNo) {
      return NextResponse.json(
        { success: false, message: "Room number is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Ensure params is not a Promise before using it
    const id = await params.id;

    // Find the pending registration
    const pendingRegistration = await User.findOne({
      _id: id,
      registrationStatus: "Pending",
    });

    if (!pendingRegistration) {
      return NextResponse.json(
        { success: false, message: "Pending registration not found" },
        { status: 404 }
      );
    }

    // Generate a random password
    const plainPassword = generateRandomPassword();
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // Update the registration status to confirmed and set allocated room
    pendingRegistration.registrationStatus = "Confirmed";
    pendingRegistration.allocatedRoomNo = allocatedRoomNo;
    pendingRegistration.checkInDate = checkInDate;
    pendingRegistration.password = hashedPassword; // Set the password

    await pendingRegistration.save();

    // Create a payment record if payment details are provided
    if (paymentDetails && paymentDetails.amount) {
      // Generate receipt number (format: PG-YYYYMMDD-XXXX)
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const receiptNumber = `PG-${dateStr}-${randomNum}`;

      // Create new payment record
      const newPayment = new Payment({
        userId: pendingRegistration._id,
        amount: Number(paymentDetails.amount),
        month: paymentDetails.month,
        paymentDate: new Date(),
        status: paymentDetails.paymentStatus || "Paid",
        paymentMethod: paymentDetails.paymentMethod || "Cash",
        receiptNumber: receiptNumber,
        remarks: "Initial payment during registration confirmation",
      });

      await newPayment.save();
    }

    // Send email with login credentials
    try {
      await sendEmail({
        to: pendingRegistration.email,
        subject: "Your Registration is Confirmed - Comfort Stay PG",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d53f8c;">Registration Confirmed - Comfort Stay PG</h2>
            <p>Dear ${pendingRegistration.name},</p>
            <p>Your registration has been confirmed. You can now login to your account using the following credentials:</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>PG ID:</strong> ${pendingRegistration.pgId}</p>
              <p><strong>Password:</strong> ${plainPassword}</p>
            </div>
            <p style="font-weight: bold;">Room Details:</p>
            <p>You have been allocated Room Number: ${allocatedRoomNo}</p>
            <p>Check-in Date: ${new Date(checkInDate).toLocaleDateString()}</p>
            ${
              paymentDetails
                ? `
            <p style="font-weight: bold;">Payment Information:</p>
            <p>Amount: ₹${paymentDetails.amount}</p>
            <p>Month: ${paymentDetails.month}</p>
            <p>Status: ${paymentDetails.paymentStatus || "Paid"}</p>
            `
                : ""
            }
            <p>Please make sure to change your password after your first login for security reasons.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Welcome to Comfort Stay PG!</p>
            <p>Best regards,<br>Comfort Stay PG Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Continue with the process even if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Registration confirmed successfully",
    });
  } catch (error) {
    console.error("Error confirming registration:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
