import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import mongoose from "mongoose";

// Define the same schema as in register-request
const PendingUserSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  fullName: { type: String, required: true },
  emailAddress: { type: String, required: true, unique: true },
  fathersName: { type: String, required: true },
  permanentAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  guardianMobileNumber: { type: String, required: true },
  validIdType: {
    type: String,
    required: true,
    enum: ["Aadhar Card", "Passport", "Driving License", "Voter Card"],
  },
  validIdPhoto: { type: String, required: true },
  companyNameAndAddress: { type: String, required: true },
  passportPhoto: { type: String, required: true },
  allocatedRoomNo: { type: String, default: "" },
  checkInDate: { type: Date },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Rejected"],
    default: "Pending",
  },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

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

    // Get the PendingUser model using the same pattern as register-request route
    const PendingUser =
      mongoose.models.PendingUser ||
      mongoose.model("PendingUser", PendingUserSchema);

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
