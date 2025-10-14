import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import User from "@/app/api/models/User";
import Notification from "@/app/api/models/Notification";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { lastStayingDate, isWithdrawal, userId: requestedUserId } = body;

    const actingUserId = user._id.toString();
    const targetUserId = requestedUserId || actingUserId;
    const isManagingDifferentUser = targetUserId.toString() !== actingUserId;

    if (isManagingDifferentUser && !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Get the latest user data to check current notice period status
    const currentUser = await User.findById(targetUserId);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const wasOnNoticePeriod = Boolean(currentUser.isOnNoticePeriod);

    // Handle notice period withdrawal
    if (isWithdrawal) {
      if (!currentUser.isOnNoticePeriod) {
        return NextResponse.json(
          { success: false, message: "You are not currently on notice period" },
          { status: 400 }
        );
      }

      // Update user to remove notice period
      const updatedUser = await User.findByIdAndUpdate(
        targetUserId,
        {
          isOnNoticePeriod: false,
          lastStayingDate: null,
        },
        { new: true }
      );

      // We don't use the updatedUser but we need to check if the update was successful
      if (!updatedUser) {
        return NextResponse.json(
          { success: false, message: "Failed to withdraw notice period" },
          { status: 500 }
        );
      }

      // Create notification for relevant party when notice period is withdrawn
      await Notification.create({
        userId: isManagingDifferentUser
          ? currentUser._id
          : "admin_id_123456789",
        title: isManagingDifferentUser
          ? "Notice Period Withdrawn by Admin"
          : "Notice Period Withdrawn",
        message: isManagingDifferentUser
          ? `An admin has withdrawn your notice period${currentUser.lastStayingDate ? ` that was scheduled for ${new Date(currentUser.lastStayingDate).toLocaleDateString()}` : ""}.`
          : `${currentUser.name || "A resident"} has withdrawn their notice period.`,
        type: "NoticePeriod",
        isRead: false,
        isActive: true,
        relatedId: currentUser._id,
        relatedModel: "User",
      });

      return NextResponse.json({
        success: true,
        message: isManagingDifferentUser
          ? "Notice period withdrawn for user"
          : "Notice period has been withdrawn successfully",
        user: {
          isOnNoticePeriod: false,
          lastStayingDate: null,
        },
      });
    }

    // Handle notice period submission
    if (!lastStayingDate) {
      return NextResponse.json(
        { success: false, message: "Last staying date is required" },
        { status: 400 }
      );
    }

    // Calculate minimum date - 20 days for new notice, 10 days for extending existing notice
    const today = new Date();
    const minimumDate = new Date(today);

    if (currentUser.isOnNoticePeriod) {
      // If already on notice period, only need 10 days minimum notice
      minimumDate.setDate(today.getDate() + 5);
    } else {
      // First time notice period needs 20 days minimum notice
      minimumDate.setDate(today.getDate() + 1); // Changed from 30 days to 1 day (next day)
    }

    const selectedDate = new Date(lastStayingDate);

    if (Number.isNaN(selectedDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid last staying date" },
        { status: 400 }
      );
    }

    if (selectedDate < minimumDate) {
      const daysRequired = currentUser.isOnNoticePeriod ? 10 : 1; // Changed from 30 to 1
      return NextResponse.json(
        {
          success: false,
          message: `Last staying date must be at least ${daysRequired} day from today`,
        },
        { status: 400 }
      );
    }

    // Update the user's notice period details
    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      {
        isOnNoticePeriod: true,
        lastStayingDate: selectedDate,
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Failed to update user details" },
        { status: 500 }
      );
    }

    const message = wasOnNoticePeriod
      ? "Notice period updated successfully"
      : "Notice period submitted successfully";

    const notificationTitle = wasOnNoticePeriod
      ? isManagingDifferentUser
        ? "Notice Period Updated by Admin"
        : "Notice Period Updated"
      : isManagingDifferentUser
        ? "Notice Period Submitted by Admin"
        : "New Notice Period";

    const notificationMessage = isManagingDifferentUser
      ? `An admin has ${wasOnNoticePeriod ? "updated" : "submitted"} your notice period with last staying date: ${selectedDate.toLocaleDateString()}`
      : `${currentUser.name || "A resident"} has ${wasOnNoticePeriod ? "updated their" : "submitted a"} notice period with last staying date: ${selectedDate.toLocaleDateString()}`;

    // Create notification for relevant party when user submits or updates notice period
    await Notification.create({
      userId: isManagingDifferentUser ? currentUser._id : "admin_id_123456789",
      title: notificationTitle,
      message: notificationMessage,
      type: "NoticePeriod",
      isRead: false,
      isActive: true,
      relatedId: currentUser._id,
      relatedModel: "User",
    });

    return NextResponse.json({
      success: true,
      message: isManagingDifferentUser
        ? wasOnNoticePeriod
          ? "Notice period updated for user"
          : "Notice period submitted for user"
        : message,
      user: {
        isOnNoticePeriod: updatedUser.isOnNoticePeriod,
        lastStayingDate: updatedUser.lastStayingDate,
      },
    });
  } catch (error) {
    console.error("Notice period submission error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
