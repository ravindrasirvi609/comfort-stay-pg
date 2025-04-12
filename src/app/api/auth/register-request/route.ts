import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { hashPassword } from "@/app/lib/auth";
import mongoose from "mongoose";

// Define a schema for pending user registrations
const PendingUserSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  fullName: {
    type: String,
    required: true,
  },
  emailAddress: {
    type: String,
    required: true,
    unique: true,
  },
  fathersName: {
    type: String,
    required: true,
  },
  permanentAddress: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  guardianMobileNumber: {
    type: String,
    required: true,
  },
  validIdType: {
    type: String,
    required: true,
    enum: ["Aadhar Card", "Passport", "Driving License", "Voter Card"],
  },
  validIdPhoto: {
    type: String, // URL to the uploaded ID photo
    required: true,
  },
  companyNameAndAddress: {
    type: String,
    required: true,
  },
  passportPhoto: {
    type: String, // URL to the uploaded passport photo
    required: true,
  },
  allocatedRoomNo: {
    type: String,
    default: "",
  },
  checkInDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Rejected"],
    default: "Pending",
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create or get the model
const PendingUser =
  mongoose.models.PendingUser ||
  mongoose.model("PendingUser", PendingUserSchema);

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
      companyNameAndAddress,
      passportPhoto,
      password,
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
      !companyNameAndAddress ||
      !passportPhoto ||
      !password
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if email already exists in pending registrations
    const existingPendingRequest = await PendingUser.findOne({ emailAddress });

    if (existingPendingRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "A registration request with this email already exists",
        },
        { status: 400 }
      );
    }

    // Check if email already exists in User collection
    const User = mongoose.models.User;
    if (User) {
      const existingUser = await User.findOne({ email: emailAddress });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "A user with this email already exists" },
          { status: 400 }
        );
      }
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create new pending user request
    const newPendingUser = new PendingUser({
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
      companyNameAndAddress,
      passportPhoto,
      password: hashedPassword,
    });

    await newPendingUser.save();

    // Send confirmation email to the user
    // Note: Email will be sent only when admin approves the registration

    // TODO: Send notification to admin about new registration request

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
