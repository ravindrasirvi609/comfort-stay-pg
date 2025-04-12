import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import mongoose from "mongoose";

export async function GET() {
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

    // Get all pending registrations
    const pendingRegistrations = await PendingUser.find({})
      .sort({ createdAt: -1 }) // Sort by most recent first
      .select("-password"); // Exclude password field

    return NextResponse.json({
      success: true,
      pendingRegistrations,
    });
  } catch (error) {
    console.error("Error fetching pending registrations:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
