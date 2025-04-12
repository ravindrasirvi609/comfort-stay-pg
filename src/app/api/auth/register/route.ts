import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import {
  hashPassword,
  generatePgId,
  generatePassword,
  isAuthenticated,
  isAdmin,
} from "@/app/lib/auth";
import { sendWelcomeEmail } from "@/app/lib/email";
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

    const {
      name,
      email,
      phone,
      roomId = null,
      documents = [],
    } = await request.json();

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, message: "Please provide all required fields" },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Generate PG ID and random password
    const pgId = generatePgId();
    const plainPassword = generatePassword();

    // Hash the password
    const hashedPassword = await hashPassword(plainPassword);

    // Create new user
    const newUser = new User({
      name,
      email,
      phone,
      role: "user",
      password: hashedPassword,
      pgId,
      documents,
      roomId,
      isActive: true,
    });

    await newUser.save();

    // Send welcome email with credentials
    await sendWelcomeEmail(name, email, pgId, plainPassword);

    return NextResponse.json({
      success: true,
      message: "User registered successfully. Login credentials sent to email.",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        pgId: newUser.pgId,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
