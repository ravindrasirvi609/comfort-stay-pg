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
    // Build flexible userId criteria to handle ObjectId vs string storage
    let userIdCriteria: any = user._id; // default (string from JWT or hardcoded admin id)
    let possibleObjectId: any = null;
    if (typeof user._id === "string" && /^[a-fA-F0-9]{24}$/.test(user._id)) {
      try {
        const { Types } = await import("mongoose");
        possibleObjectId = new Types.ObjectId(user._id);
        userIdCriteria = { $in: [user._id, possibleObjectId] };
      } catch (convErr) {
        console.warn(
          "[Notifications] Failed to build ObjectId variant for user._id",
          convErr
        );
      }
    }

    // Base query
    let query: Record<string, any> = {
      userId: userIdCriteria,
      isActive: true,
    };

    // If this is an admin, also include notifications created using the legacy hardcoded admin ID
    if (user.role === "admin") {
      const hardcodedAdminId = "admin_id_123456789";
      // Expand userId criteria
      if (
        query.userId &&
        typeof query.userId === "object" &&
        "$in" in query.userId
      ) {
        query.userId = { $in: [...query.userId.$in, hardcodedAdminId] };
      } else if (query.userId) {
        query.userId = { $in: [query.userId, hardcodedAdminId] };
      } else {
        query.userId = hardcodedAdminId;
      }
    }

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

      // Get notifications (primary attempt)
      let notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Fallback: if none found and we had an ObjectId candidate but maybe stored only as ObjectId (rare case where JWT had string but not stored as string)
      if (notifications.length === 0 && possibleObjectId) {
        const fallbackQuery = {
          isActive: true,
          userId: possibleObjectId,
        } as any;
        notifications = await Notification.find(fallbackQuery)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
        if (notifications.length > 0) {
          console.log(
            "[Notifications] Fallback query (pure ObjectId) returned results"
          );
        }
      }

      // Get unread count
      let unreadFilter: any = { isActive: true, isRead: false };
      if (possibleObjectId) {
        unreadFilter.userId = { $in: [user._id, possibleObjectId] };
      } else {
        unreadFilter.userId = user._id;
      }
      if (user.role === "admin") {
        const hardcodedAdminId = "admin_id_123456789";
        if (
          typeof unreadFilter.userId === "object" &&
          "$in" in unreadFilter.userId
        ) {
          unreadFilter.userId = {
            $in: [...unreadFilter.userId.$in, hardcodedAdminId],
          };
        } else {
          unreadFilter.userId = {
            $in: [unreadFilter.userId, hardcodedAdminId],
          };
        }
      }
      const unreadCount = await Notification.countDocuments(unreadFilter);

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

    // Build flexible userId criteria (same logic as in GET) to handle ObjectId vs string storage
    let userIdCriteria: any = user._id;
    let possibleObjectId: any = null;
    if (typeof user._id === "string" && /^[a-fA-F0-9]{24}$/.test(user._id)) {
      try {
        const { Types } = await import("mongoose");
        possibleObjectId = new Types.ObjectId(user._id);
        userIdCriteria = { $in: [user._id, possibleObjectId] };
      } catch (convErr) {
        console.warn(
          "[Notifications PUT] Failed to build ObjectId variant",
          convErr
        );
      }
    }

    // If admin, include legacy hardcoded admin id
    if (user.role === "admin") {
      const hardcodedAdminId = "admin_id_123456789";
      if (
        userIdCriteria &&
        typeof userIdCriteria === "object" &&
        "$in" in userIdCriteria
      ) {
        userIdCriteria = { $in: [...userIdCriteria.$in, hardcodedAdminId] };
      } else {
        userIdCriteria = { $in: [userIdCriteria, hardcodedAdminId] };
      }
    }

    // Construct update filter
    let updateFilter: Record<string, any> = { isActive: true };
    if (markAll) {
      updateFilter.userId = userIdCriteria;
      updateFilter.isRead = false;
    } else {
      updateFilter._id = { $in: notificationIds };
      updateFilter.userId = userIdCriteria;
    }

    // Perform update
    const updateResult = await Notification.updateMany(updateFilter, {
      $set: { isRead: true },
    });

    // Build unread count filter with same flexible criteria
    let unreadFilter: Record<string, any> = { isActive: true, isRead: false };
    unreadFilter.userId = userIdCriteria;
    const unreadCount = await Notification.countDocuments(unreadFilter);

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
