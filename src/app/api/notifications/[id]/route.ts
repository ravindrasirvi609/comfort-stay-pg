import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import Notification from "@/app/api/models/Notification";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // Get the notification ID from params
    const { id } = await props.params;

    // Check if user is authenticated
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    try {
      // Find the notification
      const notification = await Notification.findOne({
        _id: id,
        userId: user._id, // Use the ID directly from the user object
        isActive: true,
      });

      if (!notification) {
        return NextResponse.json(
          { success: false, message: "Notification not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        notification,
      });
    } catch (queryError: any) {
      console.error("Notification query error:", queryError);

      // Log for debugging
      console.log("User ID type:", typeof user._id);
      console.log("User ID value:", user._id);
      console.log("Notification ID:", id);

      return NextResponse.json(
        {
          success: false,
          message: "Error finding notification",
          error: queryError.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Get notification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a notification (mark as inactive)
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // Get the notification ID from params
    const { id } = await props.params;

    // Check if user is authenticated
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    try {
      // Delete the notification
      const result = await Notification.findOneAndUpdate(
        {
          _id: id,
          userId: user._id, // Use the ID directly from the user object
          isActive: true,
        },
        { isActive: false },
        { new: true }
      );

      if (!result) {
        return NextResponse.json(
          { success: false, message: "Notification not found" },
          { status: 404 }
        );
      }

      // Get unread count after deletion
      const unreadCount = await Notification.countDocuments({
        userId: user._id,
        isActive: true,
        isRead: false,
      });

      return NextResponse.json({
        success: true,
        message: "Notification deleted successfully",
        unreadCount,
      });
    } catch (queryError: any) {
      console.error("Notification delete error:", queryError);

      // Log for debugging
      console.log("User ID type:", typeof user._id);
      console.log("User ID value:", user._id);

      return NextResponse.json(
        {
          success: false,
          message: "Error deleting notification",
          error: queryError.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
