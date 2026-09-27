import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import Notification from "@/app/api/models/Notification";
import User from "@/app/api/models/User";

// Admin broadcast: send a notification to a segment of resident users.
export async function POST(request: NextRequest) {
  try {
    const { isAuth, user } = await isAuthenticated();
    if (!isAuth || !user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    // The admin notifications UI (src/app/admin/notifications/page.tsx) posts
    // { title, body, url, segment } — accept "body" as an alias for "message"
    // (and silently ignore "url"/"targetUrl", which has no Notification schema field).
    const { title, message, body, segment } = await request.json();
    const notificationMessage = message || body;
    if (!title || !notificationMessage) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and message are required",
          error: "Title and message are required",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const query: Record<string, unknown> = { role: "user" };
    if (segment === "active") {
      query.isActive = true;
    }
    // segment === "all" (or unspecified) applies no extra filter beyond role: "user"

    const targetUsers = await User.find(query, "_id");
    if (targetUsers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No matching users found for this segment",
          error: "No matching users found for this segment",
        },
        { status: 400 }
      );
    }

    const docs = targetUsers.map((u) => ({
      userId: u._id,
      title,
      message: notificationMessage,
      type: "System",
      isRead: false,
      isActive: true,
    }));

    await Notification.insertMany(docs);

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${docs.length} user(s).`,
      count: docs.length,
    });
  } catch (error) {
    console.error("Send notification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send notification",
        error: "Failed to send notification",
      },
      { status: 500 }
    );
  }
}
