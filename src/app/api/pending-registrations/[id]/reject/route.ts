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

    // Ensure params is not a Promise before using it
    const id = await params.id;

    // Find the pending registration
    const pendingRegistration = await User.findOne({
      _id: id,
      registrationStatus: "Pending",
    });

    if (!pendingRegistration) {
      return NextResponse.json(
        { success: false, message: "Pending registration not found" },
        { status: 404 }
      );
    }

    // Update registration status to rejected
    pendingRegistration.registrationStatus = "Rejected";
    pendingRegistration.rejectionReason = reason;
    pendingRegistration.rejectionDate = new Date();
    await pendingRegistration.save();

    // Send rejection email to the applicant
    await sendRejectionEmail(
      pendingRegistration.name,
      pendingRegistration.email,
      reason
    );

    return NextResponse.json({
      success: true,
      message: "Registration rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting registration:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
