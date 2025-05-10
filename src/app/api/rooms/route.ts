import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import Room from "@/app/api/models/Room";

// Get all rooms
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const includeResidents = searchParams.get("includeResidents") === "true";

    // Get all rooms
    let query = Room.find({ isActive: true });

    // Include resident info if requested
    if (includeResidents) {
      query = query.populate({
        path: "residents",
        select: "_id isOnNoticePeriod",
      });
    }

    // Execute the query
    const rooms = await query.sort({ floor: 1, roomNumber: 1 });

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
      building,
      roomNumber,
      floor,
      type,
      price,
      capacity,
      amenities = [],
    } = await request.json();

    // Validate required fields
    if (!building || !roomNumber || !floor || !type || !price || !capacity) {
      return NextResponse.json(
        { success: false, message: "Please provide all required fields" },
        { status: 400 }
      );
    }

    // Check if building is valid
    if (building !== "A" && building !== "B") {
      return NextResponse.json(
        { success: false, message: "Building must be either A or B" },
        { status: 400 }
      );
    }

    // Check if floor is valid (1-6)
    if (floor < 1 || floor > 6) {
      return NextResponse.json(
        { success: false, message: "Floor must be between 1 and 6" },
        { status: 400 }
      );
    }

    // Check if room with this number already exists in this building and floor
    const existingRoom = await Room.findOne({ building, floor, roomNumber });

    if (existingRoom) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Room with this number already exists in this building and floor",
        },
        { status: 400 }
      );
    }

    // Create new room
    const newRoom = new Room({
      building,
      roomNumber,
      floor,
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
