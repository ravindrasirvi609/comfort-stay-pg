import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import { User, Payment, Room } from "@/app/api/models";
import { sendEmail } from "@/app/lib/email";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { generateReceiptNumber } from "@/app/utils/receiptNumberGenerator";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string | Promise<string> }> }
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

    // Get data from the request body
    const data = await request.json();
    const { roomId, checkInDate, paymentDetails, depositAmount, keyIssued } =
      data;

    if (!roomId) {
      return NextResponse.json(
        { success: false, message: "Room ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the room by room ID
    const room = await Room.findById(roomId);

    if (!room) {
      return NextResponse.json(
        {
          success: false,
          message: "Room not found with the given ID",
        },
        { status: 404 }
      );
    }

    // Check if room has available space
    if (room.currentOccupancy >= room.capacity) {
      return NextResponse.json(
        { success: false, message: "Room is already fully occupied" },
        { status: 400 }
      );
    }

    // Find an available bed number
    const usersInRoom = await User.find({
      roomId: room._id,
      isActive: true,
    }).select("bedNumber");

    const occupiedBedNumbers = usersInRoom.map((u) => u.bedNumber);
    let selectedBedNumber = null;

    for (let i = 1; i <= room.capacity; i++) {
      if (!occupiedBedNumbers.includes(i)) {
        selectedBedNumber = i;
        break;
      }
    }

    if (selectedBedNumber === null) {
      return NextResponse.json(
        { success: false, message: "No available beds in this room" },
        { status: 400 }
      );
    }

    // Ensure params is not a Promise before using it
    const id = typeof params.id === "string" ? params.id : await params.id;

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

    // Recheck that the registration is still in 'Pending' status before proceeding
    const currentStatus = await User.findById(pendingRegistration._id).select(
      "registrationStatus"
    );
    if (currentStatus?.registrationStatus !== "Pending") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This registration has already been processed. Please refresh the page.",
        },
        { status: 409 }
      );
    }

    // Generate PG ID from the user's email address
    // Example: for john.doe@example.com, create PG-JD1234
    const email = pendingRegistration.email;
    let pgIdPrefix = "";

    // Extract initials from email (before the @ symbol)
    const emailUsername = email.split("@")[0];
    // Get the first part of the email (before dots or special characters)
    const nameParts = emailUsername.split(/[^a-zA-Z]/).filter(Boolean);

    if (nameParts.length >= 2) {
      // If there are multiple parts, take first letter of each part
      pgIdPrefix = nameParts
        .map((part: string) => part[0].toUpperCase())
        .join("");
    } else if (nameParts.length === 1) {
      // If there's only one part, take first 2 letters
      pgIdPrefix = nameParts[0].substring(0, 2).toUpperCase();
    } else {
      // Fallback to first 2 chars of email
      pgIdPrefix = emailUsername.substring(0, 2).toUpperCase();
    }

    // Add random numbers to make it unique
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const pgId = `PG-${pgIdPrefix}${randomNum}`;

    // Create standard password based on mobile number's last 4 digits
    const phone = pendingRegistration.phone;
    const lastFourDigits = phone.slice(-4);
    const plainPassword = `Comfort@${lastFourDigits}`;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // Generate receipt number if payment is being made
    let receiptNumber;
    if (paymentDetails && paymentDetails.amount) {
      receiptNumber = await generateReceiptNumber();
    }

    try {
      // Update the registration status to Approved and set room details
      pendingRegistration.registrationStatus = "Approved";
      pendingRegistration.roomId = room._id;
      pendingRegistration.bedNumber = selectedBedNumber;
      pendingRegistration.moveInDate = checkInDate;
      pendingRegistration.password = hashedPassword;
      pendingRegistration.approvalDate = new Date();
      pendingRegistration.pgId = pgId;
      pendingRegistration.isActive = true;
      pendingRegistration.keyIssued = keyIssued || false;

      await pendingRegistration.save();

      // Increment room occupancy
      room.currentOccupancy += 1;
      await room.save();

      // If payment details are provided, create a payment record
      if (paymentDetails && paymentDetails.amount) {
        await Payment.create({
          userId: pendingRegistration._id,
          amount: paymentDetails.amount,
          months: Array.isArray(paymentDetails.months)
            ? paymentDetails.months
            : [paymentDetails.months],
          paymentMethod: paymentDetails.paymentMethod || "Cash",
          paymentStatus: paymentDetails.paymentStatus || "Paid",
          paymentDate: new Date(),
          depositAmount: depositAmount || 0,
          receiptNumber: receiptNumber,
        });

        // Store receipt number for email
        pendingRegistration.lastReceiptNumber = receiptNumber;
      }
    } catch (error) {
      console.error("Operation error:", error);
      throw error;
    }

    // Send email with login credentials
    try {
      await sendEmail({
        to: pendingRegistration.email,
        subject: "Your Registration is Approved - Comfort Stay PG",
        html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration Approved - Comfort Stay PG</title>
      <!--[if mso]>
      <style type="text/css">
        table {border-collapse: collapse;}
        .button {padding: 14px 30px !important;}
        .gradient-bg {background: #FF92B7 !important;}
      </style>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif; background-color: #fff5f8; color: #4a4a4a;">
      <center>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 20px; margin-bottom: 20px;">
          <!-- Header -->
          <tr>
            <td style="padding: 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="background: linear-gradient(90deg, #FF92B7 0%, #FFC0D6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 600;">Comfort Stay PG</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <h1 style="color: #FF92B7; font-size: 24px; margin: 0 0 20px; font-weight: 600;">Registration Approved!</h1>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px;">Dear ${pendingRegistration.name},</p>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 25px;">We're delighted to inform you that your registration has been approved. Welcome to the Comfort Stay PG family! You can now login to your account using the following credentials:</p>
              
              <!-- Credentials Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffeef5; border-radius: 8px; margin: 0 0 25px;">
                <tr>
                  <td style="padding: 20px 25px;">
                    <p style="font-size: 15px; margin: 0 0 10px;"><strong style="color: #d53f8c;">PG ID:</strong> ${pgId}</p>
                    <p style="font-size: 15px; margin: 0;"><strong style="color: #d53f8c;">Password:</strong> ${plainPassword}</p>
                    <p style="font-size: 14px; color: #666; margin: 15px 0 0; font-style: italic;">Please keep this information secure and change your password after your first login.</p>
                  </td>
                </tr>
              </table>
              
              <!-- Room Details -->
              <h2 style="color: #d53f8c; font-size: 18px; margin: 0 0 15px; font-weight: 600;">Your Room Details</h2>
              
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: separate; border-spacing: 0 8px; margin: 0 0 25px;">
                <tr>
                  <td width="140" style="font-size: 15px; color: #666;">Room Number:</td>
                  <td style="font-size: 15px; font-weight: 600;">${room.roomNumber}</td>
                </tr>
                <tr>
                  <td width="140" style="font-size: 15px; color: #666;">Bed Number:</td>
                  <td style="font-size: 15px; font-weight: 600;">${selectedBedNumber}</td>
                </tr>
                <tr>
                  <td width="140" style="font-size: 15px; color: #666;">Check-in Date:</td>
                  <td style="font-size: 15px; font-weight: 600;">${new Date(checkInDate).toLocaleDateString()}</td>
                </tr>
              </table>
              
              ${
                paymentDetails
                  ? `
              <!-- Payment Information -->
              <h2 style="color: #d53f8c; font-size: 18px; margin: 0 0 15px; font-weight: 600;">Payment Information</h2>
              
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: separate; border-spacing: 0 8px; margin: 0 0 25px;">
                <tr>
                  <td width="140" style="font-size: 15px; color: #666;">Amount:</td>
                  <td style="font-size: 15px; font-weight: 600;">₹${paymentDetails.amount}</td>
                </tr>
                <tr>
                  <td width="140" style="font-size: 15px; color: #666;">Months:</td>
                  <td style="font-size: 15px; font-weight: 600;">${Array.isArray(paymentDetails.months) ? paymentDetails.months.join(", ") : paymentDetails.months}</td>
                </tr>
                <tr>
                  <td width="140" style="font-size: 15px; color: #666;">Status:</td>
                  <td style="font-size: 15px; font-weight: 600;">${paymentDetails.paymentStatus || "Paid"}</td>
                </tr>
                <tr>
                  <td width="140" style="font-size: 15px; color: #666;">Receipt Number:</td>
                  <td style="font-size: 15px; font-weight: 600;">${pendingRegistration.lastReceiptNumber}</td>
                </tr>
                ${
                  depositAmount
                    ? `
                <tr>
                  <td width="140" style="font-size: 15px; color: #666;">Security Deposit:</td>
                  <td style="font-size: 15px; font-weight: 600;">₹${depositAmount}</td>
                </tr>
                `
                    : ""
                }
              </table>
              `
                  : ""
              }
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 25px;">If you have any questions or need assistance, please don't hesitate to contact us. Our staff is available 24/7 to help you.</p>
              
              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://www.comfortstaypg.com/login" target="_blank" style="background: linear-gradient(90deg, #FF92B7 0%, #FFC0D6 100%); color: white; text-decoration: none; font-weight: 600; padding: 14px 30px; border-radius: 6px; font-size: 16px; display: inline-block; text-align: center;">Login to Your Account</a>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px;">Welcome to Comfort Stay PG! We're excited to have you join our community.</p>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0;">Warm Regards,<br>
              <strong>Comfort Stay PG Team</strong></p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="background-color: #f9f9f9; padding: 20px 40px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #eee;">
                    <p style="font-size: 14px; color: #666; margin: 0 0 10px;">© 2025 Comfort Stay PG. All rights reserved.</p>
                    <p style="font-size: 14px; color: #666; margin: 0 0 5px;">Hinjewadi Phase 1 Rd, Mukai Nagar, Pune, Maharashtra 411057</p>
                    <p style="font-size: 14px; margin: 15px 0 0;">
                      <a href="tel:+919922538989" style="color: #FF92B7; text-decoration: none; margin: 0 10px;">+91 9922 538 989</a> |
                      <a href="mailto:info@comfortstay.com" style="color: #FF92B7; text-decoration: none; margin: 0 10px;">info@comfortstay.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `,
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Continue with the process even if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Registration approved successfully",
      pgId: pgId, // Return the pgId to client
    });
  } catch (error) {
    console.error("Error confirming registration:", error);

    // More detailed error for MongoDB issues
    let errorMessage = "Internal server error";
    if (error instanceof mongoose.Error) {
      errorMessage = `MongoDB error: ${error.message}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
