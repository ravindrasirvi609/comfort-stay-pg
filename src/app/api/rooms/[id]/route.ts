import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import Room from "@/app/api/models/Room";

// Get a single room
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Find room by ID
    const room = await Room.findById(params.id);

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("Get room error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update a room (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      currentOccupancy,
      amenities,
      status,
    } = await request.json();

    // Find the room
    const roomToUpdate = await Room.findById(params.id);

    if (!roomToUpdate) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    // If room number is changed, check if the new number already exists
    if (roomNumber && roomNumber !== roomToUpdate.roomNumber) {
      const existingRoom = await Room.findOne({ roomNumber });

      if (existingRoom) {
        return NextResponse.json(
          { success: false, message: "Room with this number already exists" },
          { status: 400 }
        );
      }

      roomToUpdate.roomNumber = roomNumber;
    }

    // Update fields if provided
    if (type) roomToUpdate.type = type;
    if (price) roomToUpdate.price = price;
    if (capacity) roomToUpdate.capacity = capacity;
    if (currentOccupancy !== undefined)
      roomToUpdate.currentOccupancy = currentOccupancy;
    if (amenities) roomToUpdate.amenities = amenities;
    if (status) roomToUpdate.status = status;

    // Update timestamp
    roomToUpdate.updatedAt = new Date();

    // Save the updated room
    await roomToUpdate.save();

    return NextResponse.json({
      success: true,
      message: "Room updated successfully",
      room: roomToUpdate,
    });
  } catch (error) {
    console.error("Update room error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a room (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Find the room
    const roomToDelete = await Room.findById(params.id);

    if (!roomToDelete) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    // Check if room has occupants
    if (roomToDelete.currentOccupancy > 0) {
      return NextResponse.json(
        { success: false, message: "Cannot delete room with occupants" },
        { status: 400 }
      );
    }

    // Soft delete the room
    roomToDelete.isActive = false;
    roomToDelete.updatedAt = new Date();
    await roomToDelete.save();

    return NextResponse.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Delete room error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
