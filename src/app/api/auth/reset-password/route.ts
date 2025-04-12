import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import {
  hashPassword,
  generatePassword,
  isAuthenticated,
  isAdmin,
} from "@/app/lib/auth";
import { sendResetCredentialsEmail } from "@/app/lib/email";
import User from "@/app/api/models/User";

export async function POST(request: NextRequest) {
  try {
    // Check if the request is made by an admin
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user || !isAdmin(user)) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Admin privileges required.",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { userId } = await request.json();

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Find the user
    const userToReset = await User.findById(userId);

    if (!userToReset) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Generate a new random password
    const plainPassword = generatePassword();

    // Hash the new password
    const hashedPassword = await hashPassword(plainPassword);

    // Update the user's password
    userToReset.password = hashedPassword;
    await userToReset.save();

    // Send email with new credentials
    await sendResetCredentialsEmail(
      userToReset.name,
      userToReset.email,
      userToReset.pgId,
      plainPassword
    );

    return NextResponse.json({
      success: true,
      message:
        "Password reset successfully. New credentials sent to user's email.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
