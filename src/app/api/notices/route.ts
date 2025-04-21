import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import Notice from "@/app/api/models/Notice";
import User from "@/app/api/models/User";
import Notification from "@/app/api/models/Notification";
import mongoose from "mongoose";

// Get all notices
export async function GET() {
  try {
    // Check if user is authenticated
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get all notices
    const notices = await Notice.find({ isActive: true })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      notices,
    });
  } catch (error) {
    console.error("Get notices error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new notice (admin only)
export async function POST(request: NextRequest) {
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

    const { title, description } = await request.json();

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: "Please provide all required fields" },
        { status: 400 }
      );
    }

    // Handle the special case for hardcoded admin ID
    let createdByValue;

    if (user._id === "admin_id_123456789") {
      // For the hardcoded admin ID, create a MongoDB ObjectId
      createdByValue = new mongoose.Types.ObjectId();
    } else {
      // For regular users, use their ID directly (it should already be an ObjectId)
      createdByValue = user._id;
    }

    // Create new notice with the appropriate createdBy value
    const newNotice = new Notice({
      title,
      description,
      createdBy: createdByValue,
    });

    await newNotice.save();

    // Create notifications for all users
    try {
      // Find all active users
      const users = await User.find({ isActive: true, role: "user" });

      // Create notification for each user
      const notificationPromises = users.map((user) => {
        return Notification.create({
          userId: user._id,
          title: "New Notice Posted",
          message: `New notice posted: ${title}`,
          type: "Notice",
          isRead: false,
          isActive: true,
          relatedId: newNotice._id,
          relatedModel: "Notice",
        });
      });

      // Execute all notification creation promises
      await Promise.all(notificationPromises);
    } catch (notificationError) {
      console.error("Error creating notifications:", notificationError);
      // Continue even if notification creation fails
    }

    return NextResponse.json({
      success: true,
      message: "Notice created successfully",
      notice: newNotice,
    });
  } catch (error) {
    console.error("Create notice error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
