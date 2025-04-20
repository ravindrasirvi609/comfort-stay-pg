import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated } from "@/app/lib/auth";
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
    const { lastStayingDate, isWithdrawal } = body;

    await connectToDatabase();

    // Get the latest user data to check current notice period status
    const currentUser = await User.findById(user._id);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

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
        user._id,
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

      // Create notification for admin when user withdraws notice period
      await Notification.create({
        userId: "admin_id_123456789", // Admin ID
        title: "Notice Period Withdrawn",
        message: `${currentUser.name || "A resident"} has withdrawn their notice period.`,
        type: "NoticePeriod",
        isRead: false,
        isActive: true,
        relatedId: currentUser._id,
        relatedModel: "User",
      });

      return NextResponse.json({
        success: true,
        message: "Notice period has been withdrawn successfully",
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

    // Calculate minimum date - 30 days for new notice, 10 days for extending existing notice
    const today = new Date();
    const minimumDate = new Date(today);

    if (currentUser.isOnNoticePeriod) {
      // If already on notice period, only need 10 days minimum notice
      minimumDate.setDate(today.getDate() + 10);
    } else {
      // First time notice period needs 30 days minimum notice
      minimumDate.setDate(today.getDate() + 30);
    }

    const selectedDate = new Date(lastStayingDate);

    if (selectedDate < minimumDate) {
      const daysRequired = currentUser.isOnNoticePeriod ? 10 : 30;
      return NextResponse.json(
        {
          success: false,
          message: `Last staying date must be at least ${daysRequired} days from today`,
        },
        { status: 400 }
      );
    }

    // Update the user's notice period details
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
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

    const message = currentUser.isOnNoticePeriod
      ? "Notice period updated successfully"
      : "Notice period submitted successfully";

    // Create notification for admin when user submits or updates notice period
    await Notification.create({
      userId: "admin_id_123456789", // Admin ID
      title: currentUser.isOnNoticePeriod
        ? "Notice Period Updated"
        : "New Notice Period",
      message: `${currentUser.name || "A resident"} has ${currentUser.isOnNoticePeriod ? "updated their" : "submitted a"} notice period with last staying date: ${selectedDate.toLocaleDateString()}`,
      type: "NoticePeriod",
      isRead: false,
      isActive: true,
      relatedId: currentUser._id,
      relatedModel: "User",
    });

    return NextResponse.json({
      success: true,
      message,
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
