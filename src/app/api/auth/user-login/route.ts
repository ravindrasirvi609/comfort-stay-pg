import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { comparePassword, generateToken } from "@/app/lib/auth";
import User from "@/app/api/models/User";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Check if all fields are provided
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Please provide all required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find user by email with case-insensitive search
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "Your account has been deactivated" },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token (admin: 1 day, others: 30 days)
    const isAdmin = user.role === "admin";
    const token = await generateToken(
      {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        pgId: user.pgId,
      },
      { expiresIn: isAdmin ? "1d" : "30d" }
    );

    // Set cookie with matching maxAge
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: isAdmin ? 60 * 60 * 24 : 60 * 60 * 24 * 30, // 1 day for admin, 30 days for users
    });

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("User login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
