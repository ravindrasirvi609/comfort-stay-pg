import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import User from "@/app/api/models/User";
import Room from "@/app/api/models/Room";
import Payment from "@/app/api/models/Payment";
import { NextRequest } from "next/server";
import { generateReceiptNumber } from "@/app/utils/receiptNumberGenerator";
import { format } from "date-fns";
import UserArchive from "@/app/api/models/UserArchive";
import {
  validateAndFindAvailableBed,
  validateSpecificBed,
} from "@/app/lib/bedValidation";

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
      archiveId, // optional: if provided, remove or mark archive as reactivated
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
      // First check if user exists in UserArchive (inactive users are stored here)
      let userToActivate = await User.findById(userId);
      let existingUser = null; // Track if we found an existing user vs created new one

      // If not found in User collection, check UserArchive
      if (!userToActivate) {
        console.log(
          "User not found in User collection, checking UserArchive for userId:",
          userId,
          "Type:",
          typeof userId
        );

        // Debug: Check if UserArchive collection has any records
        const totalArchives = await UserArchive.countDocuments();
        console.log("Total UserArchive records in database:", totalArchives);

        // Debug: Get a sample of UserArchive records to see their structure
        const sampleArchives = await UserArchive.find({})
          .limit(3)
          .select("name _id userId")
          .lean();
        console.log("Sample UserArchive records structure:");
        sampleArchives.forEach((archive, index) => {
          console.log(
            `${index + 1}. Name: ${archive.name}, _id: ${archive._id}, userId: ${archive.userId}, userId type: ${typeof archive.userId}`
          );
        });

        // Try to find by userId first
        let archivedUser = await UserArchive.findOne({ userId: userId });
        console.log(
          "Search by userId result:",
          archivedUser ? `Found: ${archivedUser.name}` : "Not found"
        );

        // If not found by userId, try by _id (in case userId wasn't set properly)
        if (!archivedUser) {
          archivedUser = await UserArchive.findById(userId);
          console.log(
            "Search by _id result:",
            archivedUser ? `Found: ${archivedUser.name}` : "Not found"
          );
        }

        // If still not found, try finding by _id as string (fallback)
        if (!archivedUser) {
          archivedUser = await UserArchive.findOne({ _id: userId });
          console.log(
            "Search by _id as string result:",
            archivedUser ? `Found: ${archivedUser.name}` : "Not found"
          );
        }

        if (!archivedUser) {
          console.log("User not found in any UserArchive search method");
          return NextResponse.json(
            { success: false, message: "User not found in archives" },
            { status: 404 }
          );
        }

        console.log(
          "Found archived user:",
          archivedUser.name,
          "with ID:",
          archivedUser._id
        );

        // Restore user from archive to User collection
        // Check if the original user still exists in User collection
        const originalUserId = archivedUser.userId;
        let existingUser = null;

        if (originalUserId) {
          existingUser = await User.findById(originalUserId);
        }

        // If not found by ID, try to find by email (user might exist but with different ID)
        if (!existingUser && archivedUser.email) {
          existingUser = await User.findOne({ email: archivedUser.email });
          console.log(
            "User not found by ID, but found by email:",
            existingUser ? existingUser.name : "Not found"
          );
        }

        if (existingUser) {
          // User still exists, just update their status
          console.log(
            "Found existing user in User collection, updating status"
          );
          userToActivate = existingUser;
        } else {
          // User was deleted, create new user from archive data
          console.log(
            "User not found in User collection, creating from archive"
          );
          userToActivate = new User({
            // Don't set _id, let MongoDB generate a new one
            name: archivedUser.name,
            email: archivedUser.email,
            phone: archivedUser.phone,
            role: archivedUser.role,
            password: archivedUser.password,
            pgId: archivedUser.pgId,
            registrationStatus: archivedUser.registrationStatus,
            fathersName: archivedUser.fathersName,
            permanentAddress: archivedUser.permanentAddress,
            city: archivedUser.city,
            state: archivedUser.state,
            guardianMobileNumber: archivedUser.guardianMobileNumber,
            validIdType: archivedUser.validIdType,
            companyName: archivedUser.companyName,
            companyAddress: archivedUser.companyAddress,
            validIdPhoto: archivedUser.validIdPhoto,
            profileImage: archivedUser.profileImage,
            documents: archivedUser.documents,
            roomId: archivedUser.roomId,
            bedNumber: archivedUser.bedNumber,
            rejectionReason: archivedUser.rejectionReason,
            moveInDate: archivedUser.moveInDate,
            moveOutDate: archivedUser.moveOutDate,
            approvalDate: archivedUser.approvalDate,
            rejectionDate: archivedUser.rejectionDate,
            isActive: false, // Will be set to true below
            depositFees: archivedUser.depositFees,
            isOnNoticePeriod: archivedUser.isOnNoticePeriod,
            lastStayingDate: archivedUser.lastStayingDate,
            isDeleted: false,
            keyIssued: archivedUser.keyIssued,
            depositReturn: archivedUser.depositReturn,
          });
        }

        // Save the restored user
        await userToActivate.save();
      }

      // Now proceed with activation logic...

      // Handle room assignment and validation if needed
      if (roomId) {
        const room = await Room.findById(roomId);

        if (!room) {
          return NextResponse.json(
            { success: false, message: "Room not found" },
            { status: 404 }
          );
        }

        // Check if user has a previous bed number from archive
        let bedNumberToAssign = userToActivate.bedNumber;

        if (bedNumberToAssign) {
          // Validate if the previous bed is still available
          const bedValidation = await validateSpecificBed(
            roomId,
            bedNumberToAssign,
            userToActivate._id
          );

          if (!bedValidation.isValid) {
            console.log(
              `Previous bed ${bedNumberToAssign} not available: ${bedValidation.message}`
            );
            bedNumberToAssign = null; // Will find a new bed below
          }
        }

        // If no valid bed number, find an available one
        if (!bedNumberToAssign) {
          const availableBedValidation = await validateAndFindAvailableBed(
            roomId,
            userToActivate._id
          );

          if (!availableBedValidation.isValid) {
            return NextResponse.json(
              { success: false, message: availableBedValidation.message },
              { status: 400 }
            );
          }

          bedNumberToAssign = availableBedValidation.bedNumber;
        }

        // Assign the room and bed
        userToActivate.roomId = roomId;
        userToActivate.bedNumber = bedNumberToAssign;

        // Update room occupancy
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

      // If archiveId provided, delete that archive entry
      if (archiveId) {
        const archiveRecord = await UserArchive.findById(archiveId);
        if (archiveRecord) {
          await archiveRecord.deleteOne();
        }
      } else if (!existingUser) {
        // If no archiveId provided AND we created a new user from archive,
        // try to find and delete by userId
        let archiveRecord = await UserArchive.findOne({ userId: userId });

        // If not found by userId, try by _id
        if (!archiveRecord) {
          archiveRecord = await UserArchive.findById(userId);
        }

        // If still not found, try by _id as string
        if (!archiveRecord) {
          archiveRecord = await UserArchive.findOne({ _id: userId });
        }

        if (archiveRecord) {
          await archiveRecord.deleteOne();
        }
      }

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
