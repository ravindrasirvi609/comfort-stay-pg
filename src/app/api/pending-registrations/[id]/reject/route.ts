import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import mongoose from "mongoose";

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

    await connectToDatabase();

    // Get the PendingUser model
    const PendingUser = mongoose.models.PendingUser;

    if (!PendingUser) {
      return NextResponse.json(
        { success: false, message: "PendingUser model not found" },
        { status: 500 }
      );
    }

    // Find the pending registration by ID
    const pendingRegistration = await PendingUser.findById(params.id);

    if (!pendingRegistration) {
      return NextResponse.json(
        { success: false, message: "Pending registration not found" },
        { status: 404 }
      );
    }

    // Update pending registration status
    pendingRegistration.status = "Rejected";
    await pendingRegistration.save();

    // Optional: Implement email notification to the applicant about rejection

    return NextResponse.json({
      success: true,
      message: "Registration request rejected",
    });
  } catch (error) {
    console.error("Error rejecting registration:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
