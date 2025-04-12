import { NextResponse } from "next/server";
import { isAuthenticated } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/db";
import User from "@/app/api/models/User";

export async function GET() {
  try {
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get full user data from database
    const userData = await User.findById(user._id).select("-password");

    if (!userData) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
