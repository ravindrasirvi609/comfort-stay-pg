import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import { User, Payment, Room } from "@/app/api/models";
import { sendEmail } from "@/app/lib/email";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

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
    const { roomId, checkInDate, paymentDetails, depositAmount } = data;

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

    // Start a MongoDB session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update the registration status to Approved and set room details
      pendingRegistration.registrationStatus = "Approved";
      pendingRegistration.roomId = room._id;
      pendingRegistration.bedNumber = selectedBedNumber;
      pendingRegistration.moveInDate = checkInDate;
      pendingRegistration.password = hashedPassword;
      pendingRegistration.approvalDate = new Date();
      pendingRegistration.pgId = pgId;

      await pendingRegistration.save({ session });

      // Increment room occupancy
      room.currentOccupancy += 1;
      await room.save({ session });

      // If payment details are provided, create a payment record
      if (paymentDetails && paymentDetails.amount) {
        // Generate unique receipt number (timestamp + user id last 5 chars)
        const timestamp = Date.now().toString();
        const userIdShort = pendingRegistration._id.toString().slice(-5);
        const receiptNumber = `PG-${timestamp.slice(-8)}-${userIdShort}`;

        // Create a single payment record with an array of months
        const newPayment = new Payment({
          userId: pendingRegistration._id,
          amount: paymentDetails.amount,
          // Make sure months is stored as an array
          months: Array.isArray(paymentDetails.months)
            ? paymentDetails.months
            : [paymentDetails.months],
          paymentMethod: paymentDetails.paymentMethod || "Cash",
          paymentStatus: paymentDetails.paymentStatus || "Paid",
          paymentDate: new Date(),
          depositAmount: depositAmount || 0,
          receiptNumber: receiptNumber, // Add receipt number to the payment record
        });

        console.log("Creating payment record with months:", newPayment.months);
        await newPayment.save({ session });

        // Store receipt number in a variable accessible outside this block
        pendingRegistration.lastReceiptNumber = receiptNumber;
      }

      // Commit the transaction
      await session.commitTransaction();
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      // End session
      session.endSession();
    }

    // Send email with login credentials
    try {
      await sendEmail({
        to: pendingRegistration.email,
        subject: "Your Registration is Approved - Comfort Stay PG",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d53f8c;">Registration Approved - Comfort Stay PG</h2>
            <p>Dear ${pendingRegistration.name},</p>
            <p>Your registration has been approved. You can now login to your account using the following credentials:</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>PG ID:</strong> ${pgId}</p>
              <p><strong>Password:</strong> ${plainPassword}</p>
            </div>
            <p style="font-weight: bold;">Room Details:</p>
            <p>You have been allocated Room Number: ${room.roomNumber}</p>
            <p>Bed Number: ${selectedBedNumber}</p>
            <p>Check-in Date: ${new Date(checkInDate).toLocaleDateString()}</p>
            ${
              paymentDetails
                ? `
            <p style="font-weight: bold;">Payment Information:</p>
            <p>Amount: ₹${paymentDetails.amount}</p>
            <p>Months: ${Array.isArray(paymentDetails.months) ? paymentDetails.months.join(", ") : paymentDetails.months}</p>
            <p>Status: ${paymentDetails.paymentStatus || "Paid"}</p>
            <p>Receipt Number: ${pendingRegistration.lastReceiptNumber}</p>
            ${depositAmount ? `<p>Security Deposit: ₹${depositAmount}</p>` : ""}
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
      message: "Registration approved successfully",
      pgId: pgId, // Return the pgId to client
    });
  } catch (error) {
    console.error("Error confirming registration:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
