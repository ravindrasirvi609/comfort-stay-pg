import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated } from "@/app/lib/auth";
import { isAdmin } from "@/app/utils/roleCheck";
import User from "@/app/api/models/User";
import Room from "@/app/api/models/Room";
import UserArchive from "@/app/api/models/UserArchive";
import Notification from "@/app/api/models/Notification";
import { differenceInDays } from "date-fns";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;

  try {
    // Check if user is authenticated
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Only admins can initiate checkout for any user, normal users can only checkout themselves
    if (user._id !== params.id && !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Get the checkout data from request
    const body = await request.json();
    const {
      archiveReason = "Completed Stay",
      exitSurvey = null,
      skipSurvey = false,
      refundAmount = 0,
      refundMethod = null,
      adminComments = "",
    } = body;

    // Find the user to checkout
    const userToCheckout = await User.findById(params.id);

    if (!userToCheckout) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is already checked out
    if (userToCheckout.moveOutDate && !userToCheckout.isActive) {
      return NextResponse.json(
        { success: false, message: "User has already been checked out" },
        { status: 400 }
      );
    }

    // Begin transaction by getting the user's room
    const userRoom = userToCheckout.roomId
      ? await Room.findById(userToCheckout.roomId)
      : null;

    // Update the room's occupancy if applicable
    if (userRoom) {
      userRoom.currentOccupancy = Math.max(0, userRoom.currentOccupancy - 1);

      // Update room status if it's now empty
      if (userRoom.currentOccupancy === 0) {
        userRoom.status = "available";
      }

      await userRoom.save();
    }

    // Calculate the stay duration
    const moveInDate = userToCheckout.moveInDate || userToCheckout.createdAt;
    const moveOutDate = new Date();
    const stayDuration = differenceInDays(moveOutDate, moveInDate);

    // Create archive record with appropriate fields
    const archiveRecord = new UserArchive({
      ...userToCheckout.toObject(),
      archiveReason,
      archiveDate: new Date(),
      exitSurveyCompleted: !!exitSurvey || skipSurvey,
      stayDuration,
      exitFeedback: exitSurvey,
      moveOutDate,
      isActive: false,
      isOnNoticePeriod: false,
    });

    await archiveRecord.save();

    // Create a notification for the admin
    await Notification.create({
      userId: isAdmin(user) ? params.id : "admin_id_123456789", // If admin is checking out a user, notify that user
      title: "Checkout Completed",
      message: `${userToCheckout.name} has been checked out. ${adminComments ? `Admin comments: ${adminComments}` : ""}`,
      type: "Checkout",
      isRead: false,
      isActive: true,
      relatedId: archiveRecord._id,
      relatedModel: "UserArchive",
    });

    // Update user record to reflect checkout
    userToCheckout.isActive = false;
    userToCheckout.isOnNoticePeriod = false;
    userToCheckout.moveOutDate = moveOutDate;
    userToCheckout.roomId = null;
    userToCheckout.bedNumber = null;
    await userToCheckout.save();

    return NextResponse.json({
      success: true,
      message: "User has been successfully checked out",
      archiveId: archiveRecord._id,
    });
  } catch (error: any) {
    console.error("Error checking out user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Endpoint to get checkout details if a user wants to complete their exit survey later
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;

  try {
    // Check if user is authenticated
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Only admins or the specific user can see checkout details
    if (user._id !== params.id && !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Find the archive record for this user
    const archiveRecord = await UserArchive.findOne({
      _id: { $ne: user._id }, // Using _id as a reference since we convert user object
      email: user.email, // Using email as fallback to find the record
    }).sort({ archiveDate: -1 }); // Get the most recent archive record

    if (!archiveRecord) {
      return NextResponse.json(
        { success: false, message: "No checkout record found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      checkout: {
        archiveDate: archiveRecord.archiveDate,
        stayDuration: archiveRecord.stayDuration,
        exitSurveyCompleted: archiveRecord.exitSurveyCompleted,
        moveOutDate: archiveRecord.moveOutDate,
      },
    });
  } catch (error: any) {
    console.error("Error retrieving checkout details:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Update an existing checkout record (for example to add exit survey responses later)
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;

  try {
    // Check if user is authenticated
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Only the specific user or admin can update checkout details
    if (user._id !== params.id && !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { exitSurvey } = body;

    if (!exitSurvey) {
      return NextResponse.json(
        { success: false, message: "Exit survey data is required" },
        { status: 400 }
      );
    }

    // Find the archive record for this user
    const archiveRecord = await UserArchive.findOne({
      _id: { $ne: user._id },
      email: user.email,
    }).sort({ archiveDate: -1 }); // Get the most recent archive record

    if (!archiveRecord) {
      return NextResponse.json(
        { success: false, message: "No checkout record found" },
        { status: 404 }
      );
    }

    // Update the archive record with survey data
    archiveRecord.exitFeedback = exitSurvey;
    archiveRecord.exitSurveyCompleted = true;
    await archiveRecord.save();

    return NextResponse.json({
      success: true,
      message: "Exit survey submitted successfully",
    });
  } catch (error: any) {
    console.error("Error updating checkout details:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
