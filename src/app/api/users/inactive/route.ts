import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import User from "@/app/api/models/User";
import Room from "@/app/api/models/Room";
import Payment from "@/app/api/models/Payment";
import { NextRequest } from "next/server";
import { generateReceiptNumber } from "@/app/utils/receiptNumberGenerator";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  // Redirect to the archives API since all deactivated users are now in archives
  return NextResponse.redirect(new URL("/api/user-archives", request.url), 301);
}

export async function PUT(request: NextRequest) {
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
      roomId,
      checkInDate,
      clearNoticePeriod = true,
      // Payment related fields
      collectDeposit = false,
      depositAmount = 0,
      collectRent = false,
      rentAmount = 0,
      selectedMonths = [],
      paymentMethod = "Cash",
      transactionId = "",
      paymentRemarks = "",
    } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    try {
      // Find the user first to check if exists
      const userToActivate = await User.findById(userId);

      if (!userToActivate) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      // Use transaction-less approach instead to avoid client session issues
      // First, handle room assignment and validation if needed
      if (roomId) {
        const room = await Room.findById(roomId);

        if (!room) {
          return NextResponse.json(
            { success: false, message: "Room not found" },
            { status: 404 }
          );
        }

        if (room.currentOccupancy >= room.capacity) {
          return NextResponse.json(
            { success: false, message: "Room is at full capacity" },
            { status: 400 }
          );
        }

        // Assign the room
        userToActivate.roomId = roomId;

        // Increment room occupancy
        room.currentOccupancy += 1;
        await room.save();
      }

      // Update user status
      userToActivate.isActive = true;
      userToActivate.isDeleted = false; // Ensure the user is not marked as deleted
      userToActivate.moveInDate = checkInDate || new Date();

      // Update move out date to null since user is active again
      userToActivate.moveOutDate = null;

      // Handle notice period status based on checkbox selection
      if (clearNoticePeriod) {
        userToActivate.isOnNoticePeriod = false;
        userToActivate.lastStayingDate = null;
      }

      // Save user changes
      await userToActivate.save();

      // Create payment entries if requested
      const payments = [];

      // Handle deposit payment if requested
      if (collectDeposit && depositAmount > 0) {
        // Generate receipt number
        const depositReceiptNumber = await generateReceiptNumber();

        // Create deposit payment record
        const depositPayment = new Payment({
          userId: userToActivate._id,
          amount: depositAmount,
          months: [format(new Date(checkInDate || Date.now()), "MMMM yyyy")],
          paymentDate: checkInDate || new Date(),
          dueDate: checkInDate || new Date(), // Same date for deposit
          paymentStatus: "Paid",
          receiptNumber: depositReceiptNumber,
          paymentMethod,
          transactionId: transactionId || undefined,
          remarks: `Security deposit for returning user: ${userToActivate.name}`,
          isDepositPayment: true,
        });

        await depositPayment.save();
        payments.push(depositPayment);

        // Update user's deposit fees
        userToActivate.depositFees = depositAmount;
        await userToActivate.save(); // Save again with deposit update
      }

      // Handle rent payment if requested
      if (collectRent && rentAmount > 0 && selectedMonths.length > 0) {
        // Generate receipt number
        const rentReceiptNumber = await generateReceiptNumber();

        // Create rent payment record
        const rentPayment = new Payment({
          userId: userToActivate._id,
          amount: rentAmount,
          months: selectedMonths,
          paymentDate: checkInDate || new Date(),
          dueDate: new Date(
            new Date(checkInDate || Date.now()).setDate(
              new Date(checkInDate || Date.now()).getDate() + 30
            )
          ), // Due date is 30 days after check-in
          paymentStatus: "Paid",
          receiptNumber: rentReceiptNumber,
          paymentMethod,
          transactionId: transactionId || undefined,
          remarks:
            paymentRemarks ||
            `Rent payment for returning user: ${userToActivate.name}`,
          isDepositPayment: false,
        });

        await rentPayment.save();
        payments.push(rentPayment);
      }

      return NextResponse.json({
        success: true,
        message: "User activated successfully",
        user: {
          _id: userToActivate._id,
          name: userToActivate.name,
          email: userToActivate.email,
          isActive: userToActivate.isActive,
          isOnNoticePeriod: userToActivate.isOnNoticePeriod,
          roomId: userToActivate.roomId,
        },
        payments: payments.length > 0 ? payments : undefined,
      });
    } catch (error) {
      console.error("Error during user activation:", error);
      throw error;
    }
  } catch (error) {
    console.error("Activate user error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
