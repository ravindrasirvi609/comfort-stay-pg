import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import User from "@/app/api/models/User";
import Notification from "@/app/api/models/Notification";
import PGDetails from "@/app/models/PGDetails";

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
      if (isManagingDifferentUser) {
        // Admin withdrew notice on behalf of the resident - notify the resident
        await Notification.create({
          userId: currentUser._id,
          title: "Notice Period Withdrawn by Admin",
          message: `An admin has withdrawn your notice period${currentUser.lastStayingDate ? ` that was scheduled for ${new Date(currentUser.lastStayingDate).toLocaleDateString()}` : ""}.`,
          type: "NoticePeriod",
          isRead: false,
          isActive: true,
          relatedId: currentUser._id,
          relatedModel: "User",
        });
      } else {
        // Resident withdrew their own notice - notify all admins
        const adminUsers = await User.find({ role: "admin" });
        const notificationPromises = adminUsers.map((admin) => {
          return Notification.create({
            userId: admin._id,
            title: "Notice Period Withdrawn",
            message: `${currentUser.name || "A resident"} has withdrawn their notice period.`,
            type: "NoticePeriod",
            isRead: false,
            isActive: true,
            relatedId: currentUser._id,
            relatedModel: "User",
          });
        });
        await Promise.all(notificationPromises);
      }

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

    // Load notice policy from PGDetails
    const pgDetails = await PGDetails.findOne();
    const minNoticeDays = pgDetails?.noticePolicy?.minNoticeDays ?? 15;
    const refundAmount = pgDetails?.noticePolicy?.refundAmount ?? 1500;

    // Date-only arithmetic — strip time so hour of day doesn't affect eligibility
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const selectedDate = new Date(lastStayingDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (Number.isNaN(selectedDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid last staying date" },
        { status: 400 }
      );
    }

    const daysDiff = Math.round(
      (selectedDate.getTime() - todayDate.getTime()) / 86_400_000
    );

    if (daysDiff < minNoticeDays) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum ${minNoticeDays} days notice required. Your selection gives only ${daysDiff} days.`,
        },
        { status: 400 }
      );
    }

    // Server decides refund eligibility — never accept isEligibleForRefund from client
    const isEligibleForRefund = daysDiff >= minNoticeDays;

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
    if (isManagingDifferentUser) {
      // Admin submitted/updated notice on behalf of the resident - notify the resident
      await Notification.create({
        userId: currentUser._id,
        title: notificationTitle,
        message: notificationMessage,
        type: "NoticePeriod",
        isRead: false,
        isActive: true,
        relatedId: currentUser._id,
        relatedModel: "User",
      });
    } else {
      // Resident submitted/updated their own notice - notify all admins
      const adminUsers = await User.find({ role: "admin" });
      const notificationPromises = adminUsers.map((admin) => {
        return Notification.create({
          userId: admin._id,
          title: notificationTitle,
          message: notificationMessage,
          type: "NoticePeriod",
          isRead: false,
          isActive: true,
          relatedId: currentUser._id,
          relatedModel: "User",
        });
      });
      await Promise.all(notificationPromises);
    }

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
      isEligibleForRefund,
      refundAmount,
      minNoticeDays,
    });
  } catch (error) {
    console.error("Notice period submission error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
