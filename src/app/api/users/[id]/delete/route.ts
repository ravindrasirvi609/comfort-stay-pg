import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated } from "@/app/lib/auth";
import { isAdmin } from "@/app/utils/roleCheck";
import User from "@/app/api/models/User";
import UserArchive from "@/app/api/models/UserArchive";
import Notification from "@/app/api/models/Notification";
import Payment from "@/app/api/models/Payment";
import Complaint from "@/app/api/models/Complaint";

// This is a permanent deletion endpoint for GDPR compliance
export async function DELETE(
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

    // Only admins can permanently delete users
    if (!isAdmin(user)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied. Only administrators can perform permanent deletions.",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Get confirmation and reason from request
    const { searchParams } = new URL(request.url);
    const confirmDelete = searchParams.get("confirm");
    const reason = searchParams.get("reason") || "User requested data deletion";

    if (confirmDelete !== "true") {
      return NextResponse.json(
        {
          success: false,
          message: "Confirmation parameter required for permanent deletion",
        },
        { status: 400 }
      );
    }

    // Find the user to delete
    const userToDelete = await User.findById(params.id);

    if (!userToDelete) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Keep minimal data for audit purposes
    const deletionRecord = {
      deletedUserEmail: userToDelete.email,
      deletedUserName: userToDelete.name,
      deletedById: user._id,
      deletedByName: user.name,
      deletionReason: reason,
      deletionDate: new Date(),
      userIdHash: Buffer.from(params.id).toString("base64"), // Store a hash of the user ID for audit purposes
    };

    // Store this minimal record in a secure logging system or database
    console.log("GDPR Deletion Record:", deletionRecord);

    // Also record the deletion in the admin activity log (implement this as needed)
    await Notification.create({
      userId: "admin_id_123456789", // Admin ID
      title: "GDPR User Deletion",
      message: `User ${userToDelete.name} (${userToDelete.email}) was permanently deleted by ${user.name}. Reason: ${reason}`,
      type: "System",
      isRead: false,
      isActive: true,
    });

    // Permanently delete all user-related data

    // 1. Delete payments
    await Payment.deleteMany({ userId: params.id });

    // 2. Delete complaints
    await Complaint.deleteMany({ userId: params.id });

    // 3. Delete notifications
    await Notification.deleteMany({
      $or: [
        { userId: params.id },
        { relatedId: params.id, relatedModel: "User" },
      ],
    });

    // 4. Delete any archived records
    await UserArchive.deleteMany({ email: userToDelete.email });

    // 5. Finally delete the user
    await User.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message:
        "User data has been permanently deleted in compliance with GDPR requirements",
    });
  } catch (error: any) {
    console.error("Error permanently deleting user:", error);
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
