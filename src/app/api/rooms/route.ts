import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import Room from "@/app/api/models/Room";

// Get all rooms
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

    // Get all rooms
    const rooms = await Room.find({ isActive: true }).sort({ roomNumber: 1 });

    return NextResponse.json({
      success: true,
      rooms,
    });
  } catch (error) {
    console.error("Get rooms error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new room (admin only)
export async function POST(request: NextRequest) {
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

    const {
      roomNumber,
      type,
      price,
      capacity,
      amenities = [],
    } = await request.json();

    // Validate required fields
    if (!roomNumber || !type || !price || !capacity) {
      return NextResponse.json(
        { success: false, message: "Please provide all required fields" },
        { status: 400 }
      );
    }

    // Check if room with this number already exists
    const existingRoom = await Room.findOne({ roomNumber });

    if (existingRoom) {
      return NextResponse.json(
        { success: false, message: "Room with this number already exists" },
        { status: 400 }
      );
    }

    // Create new room
    const newRoom = new Room({
      roomNumber,
      type,
      price,
      capacity,
      currentOccupancy: 0,
      amenities,
      status: "available",
    });

    await newRoom.save();

    return NextResponse.json({
      success: true,
      message: "Room created successfully",
      room: newRoom,
    });
  } catch (error) {
    console.error("Create room error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
