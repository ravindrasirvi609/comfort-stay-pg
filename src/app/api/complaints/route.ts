import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import Complaint from "@/app/api/models/Complaint";
import User from "@/app/api/models/User";

// Get all complaints
export async function GET() {
  try {
    // Check if user is authenticated
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // This is just to ensure User model is registered
    await User.findOne({});

    let complaints;

    // If admin, get all complaints
    if (isAdmin(user)) {
      complaints = await Complaint.find({ isActive: true })
        .populate("userId", "name email pgId")
        .sort({ createdAt: -1 });
    } else {
      // For normal users, only get their complaints
      complaints = await Complaint.find({
        userId: user._id,
        isActive: true,
      }).sort({ createdAt: -1 });
    }

    return NextResponse.json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error("Get complaints error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new complaint
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Ensure User model is registered
    await User.findOne({});

    const { title, description } = await request.json();

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: "Please provide all required fields" },
        { status: 400 }
      );
    }

    // Create new complaint
    const newComplaint = new Complaint({
      userId: user._id,
      title,
      description,
      status: "Open",
    });

    await newComplaint.save();

    return NextResponse.json({
      success: true,
      message: "Complaint submitted successfully",
      complaint: newComplaint,
    });
  } catch (error) {
    console.error("Create complaint error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
