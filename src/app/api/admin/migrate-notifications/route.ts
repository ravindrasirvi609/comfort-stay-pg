import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import Notification from "@/app/api/models/Notification";
import User from "@/app/api/models/User";

const SENTINEL_ADMIN_ID = "admin_id_123456789";

// One-time migration: converts historical notifications addressed to the
// hardcoded sentinel string into real per-admin notifications, then removes
// the sentinel-addressed originals. Safe to call multiple times (a no-op
// once no sentinel documents remain).
export async function POST() {
  try {
    const { isAuth, user } = await isAuthenticated();
    if (!isAuth || !user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const sentinelNotifications = await Notification.find({ userId: SENTINEL_ADMIN_ID });
    if (sentinelNotifications.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No sentinel notifications found. Nothing to migrate.",
        migrated: 0,
        created: 0,
      });
    }

    const adminUsers = await User.find({ role: "admin", isActive: true });
    if (adminUsers.length === 0) {
      return NextResponse.json(
        { success: false, message: "No active admin users found to migrate notifications to." },
        { status: 400 }
      );
    }

    const newDocs = [];
    for (const notif of sentinelNotifications) {
      for (const admin of adminUsers) {
        newDocs.push({
          userId: admin._id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          relatedId: notif.relatedId,
          relatedModel: notif.relatedModel,
          isRead: false, // reset read state per admin
          isActive: notif.isActive,
          createdAt: notif.createdAt,
        });
      }
    }

    await Notification.insertMany(newDocs);
    const deleteResult = await Notification.deleteMany({ userId: SENTINEL_ADMIN_ID });

    return NextResponse.json({
      success: true,
      message: `Migrated ${sentinelNotifications.length} sentinel notification(s) into ${newDocs.length} per-admin notification(s) across ${adminUsers.length} admin(s). Deleted ${deleteResult.deletedCount} original sentinel document(s).`,
      migrated: sentinelNotifications.length,
      created: newDocs.length,
      adminCount: adminUsers.length,
    });
  } catch (error) {
    console.error("Notification migration error:", error);
    return NextResponse.json(
      { success: false, message: "Migration failed" },
      { status: 500 }
    );
  }
}
