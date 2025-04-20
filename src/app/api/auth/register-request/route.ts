import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { User, Notification } from "@/app/api/models";
import { sendRegistrationConfirmationEmail } from "@/app/lib/email";

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();

    // Validate required fields
    const {
      fullName,
      emailAddress,
      fathersName,
      permanentAddress,
      city,
      state,
      mobileNumber,
      guardianMobileNumber,
      validIdType,
      validIdPhoto,
      companyName,
      companyAddress,
      profileImage,
    } = requestData;

    if (
      !fullName ||
      !emailAddress ||
      !fathersName ||
      !permanentAddress ||
      !city ||
      !state ||
      !mobileNumber ||
      !guardianMobileNumber ||
      !validIdType ||
      !validIdPhoto ||
      !companyName ||
      !companyAddress ||
      !profileImage
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if email already exists in User collection
    const existingUser = await User.findOne({ email: emailAddress });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Create new pending user request
    const newUser = new User({
      name: fullName,
      email: emailAddress,
      phone: mobileNumber,
      registrationStatus: "Pending",

      // Additional user details
      fathersName,
      permanentAddress,
      city,
      state,
      guardianMobileNumber,
      validIdType,
      validIdPhoto,
      companyName,
      companyAddress,
      profileImage,
    });

    const savedUser = await newUser.save();

    // Send confirmation email to user
    await sendRegistrationConfirmationEmail(
      fullName,
      emailAddress,
      savedUser._id
    );

    // Create notification for admin
    await Notification.create({
      userId: "admin_id_123456789", // Admin ID
      title: "New User Registration",
      message: `${fullName} has submitted a new registration request from ${city}, ${state}. Email: ${emailAddress}`,
      type: "System",
      isRead: false,
      isActive: true,
      relatedId: savedUser._id,
      relatedModel: "User",
    });

    return NextResponse.json({
      success: true,
      message:
        "Registration request submitted successfully. You will be notified once approved.",
    });
  } catch (error: unknown) {
    console.error("Registration request error:", error);

    // Define a type for MongoDB errors
    interface MongoError {
      name: string;
      message: string;
      code?: string;
    }

    // Check if it's a MongoDB connection error
    if (
      typeof error === "object" &&
      error !== null &&
      ((error as MongoError).name === "MongoConnectionError" ||
        ((error as Error).message &&
          (error as Error).message.includes("MongoDB")))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection error. Please try again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
