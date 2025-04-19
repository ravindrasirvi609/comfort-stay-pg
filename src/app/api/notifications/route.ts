import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated } from "@/app/lib/auth";
import Notification from "@/app/api/models/Notification";

// Get user notifications
export async function GET(request: NextRequest) {
  try {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const type = searchParams.get("type");

    // Build query - use the exact user ID value from the session
    // This handles both ObjectId and string IDs
    const query: Record<string, any> = {
      userId: user._id,
      isActive: true,
    };

    // Add filters if specified
    if (unreadOnly) {
      query.isRead = false;
    }

    if (type) {
      query.type = type;
    }

    try {
      // Get total count
      const total = await Notification.countDocuments(query);

      // Get notifications
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Get unread count
      const unreadCount = await Notification.countDocuments({
        userId: user._id,
        isActive: true,
        isRead: false,
      });

      return NextResponse.json({
        success: true,
        notifications,
        pagination: {
          total,
          page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit),
        },
        unreadCount,
      });
    } catch (queryError: any) {
      console.error("Notification query error:", queryError);

      // Log user ID for debugging
      console.log("User ID type:", typeof user._id);
      console.log("User ID value:", user._id);

      return NextResponse.json(
        {
          success: false,
          message: "Error processing notification query",
          error: queryError.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
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

    // Get request body
    const body = await request.json();
    const { notificationIds, markAll = false } = body;

    // Validate request
    if (
      !markAll &&
      (!notificationIds ||
        !Array.isArray(notificationIds) ||
        notificationIds.length === 0)
    ) {
      return NextResponse.json(
        { success: false, message: "Notification IDs are required" },
        { status: 400 }
      );
    }

    // Update query
    let updateResult;

    if (markAll) {
      // Mark all user's notifications as read
      updateResult = await Notification.updateMany(
        { userId: user._id, isRead: false, isActive: true },
        { $set: { isRead: true } }
      );
    } else {
      // Mark specific notifications as read
      updateResult = await Notification.updateMany(
        {
          _id: { $in: notificationIds },
          userId: user._id, // Ensure user can only mark their own notifications
          isActive: true,
        },
        { $set: { isRead: true } }
      );
    }

    // Get unread count after update
    const unreadCount = await Notification.countDocuments({
      userId: user._id,
      isActive: true,
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      message: `${updateResult.modifiedCount} notification(s) marked as read`,
      unreadCount,
    });
  } catch (error) {
    console.error("Mark notifications as read error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
