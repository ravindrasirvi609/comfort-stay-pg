import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import Room from "@/app/api/models/Room";

// Define a minimal type for the resident
interface Resident {
  _id: string;
  name: string;
  email: string;
  pgId: string;
  phone: string;
  bedNumber: number;
  moveInDate?: string;
  isOnNoticePeriod: boolean;
  lastStayingDate: string;
}

// Get a single room
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
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

    // Find room by ID and populate residents virtual
    const room = await Room.findById(params.id).populate({
      path: "residents",
      select:
        "name email pgId phone _id moveInDate bedNumber isOnNoticePeriod lastStayingDate",
    });

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    // Group users by bed number
    const roomResidents = (room.residents || []) as Resident[];
    const beds = [];

    for (let i = 1; i <= room.capacity; i++) {
      const resident = roomResidents.find((r) => r.bedNumber === i) || null;
      beds.push({
        bedNumber: i,
        isOccupied: !!resident,
        resident: resident,
      });
    }

    return NextResponse.json({
      success: true,
      room: {
        ...room.toObject(),
        beds,
      },
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
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
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
      floor,
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
    if (floor) roomToUpdate.floor = floor;
    if (type) roomToUpdate.type = type;
    if (price) roomToUpdate.price = price;
    if (capacity !== undefined) {
      // Check if the new capacity is less than current occupancy
      if (capacity < roomToUpdate.currentOccupancy) {
        return NextResponse.json(
          {
            success: false,
            message: "Cannot reduce capacity below current occupancy",
          },
          { status: 400 }
        );
      }
      roomToUpdate.capacity = capacity;
    }
    if (currentOccupancy !== undefined) {
      // Ensure occupancy doesn't exceed capacity
      if (currentOccupancy > roomToUpdate.capacity) {
        return NextResponse.json(
          {
            success: false,
            message: "Occupancy cannot exceed room capacity",
          },
          { status: 400 }
        );
      }
      roomToUpdate.currentOccupancy = currentOccupancy;
    }
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
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
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
