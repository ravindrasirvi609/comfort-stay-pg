import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import { sendRejectionEmail } from "@/app/lib/email";
import { User } from "@/app/api/models";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get request body for rejection reason
    const requestData = await request.json();
    const { reason } = requestData;

    await connectToDatabase();

    // Find the pending registration by ID
    const pendingUser = await User.findById(params.id);

    if (!pendingUser) {
      return NextResponse.json(
        { success: false, message: "Pending registration not found" },
        { status: 404 }
      );
    }

    // Check if user is already rejected or approved
    if (pendingUser.registrationStatus !== "Pending") {
      return NextResponse.json(
        {
          success: false,
          message: `This registration has already been ${pendingUser.registrationStatus.toLowerCase()}`,
        },
        { status: 400 }
      );
    }

    // Update pending registration status
    pendingUser.registrationStatus = "Rejected";
    pendingUser.rejectionReason = reason;
    pendingUser.rejectionDate = new Date();
    await pendingUser.save();

    // Send rejection email to the applicant
    await sendRejectionEmail(pendingUser.name, pendingUser.email, reason);

    return NextResponse.json({
      success: true,
      message: "Registration request rejected and applicant notified",
    });
  } catch (error) {
    console.error("Error rejecting registration:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
