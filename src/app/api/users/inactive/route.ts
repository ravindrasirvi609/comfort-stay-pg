import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import User from "@/app/api/models/User";
import Room from "@/app/api/models/Room";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
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

    // Find all inactive but not deleted users
    const inactiveUsers = await User.find({
      isActive: false,
      isDeleted: { $ne: true },
      registrationStatus: "Approved", // Only include users who were previously approved
    })
      .select("-password")
      .populate("roomId")
      .sort({ updatedAt: -1 });

    return NextResponse.json({
      success: true,
      users: inactiveUsers,
    });
  } catch (error) {
    console.error("Get inactive users error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const { userId, roomId, checkInDate } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Find the user
    const userToActivate = await User.findById(userId);

    if (!userToActivate) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update user status
    userToActivate.isActive = true;
    userToActivate.isDeleted = false; // Ensure the user is not marked as deleted
    userToActivate.moveInDate = checkInDate || new Date();

    // Update move out date to null since user is active again
    userToActivate.moveOutDate = null;

    // If on notice period, remove that flag
    if (userToActivate.isOnNoticePeriod) {
      userToActivate.isOnNoticePeriod = false;
      userToActivate.lastStayingDate = null;
    }

    // Assign room if provided
    if (roomId) {
      // First, check if the room exists and has capacity
      const room = await Room.findById(roomId);

      if (!room) {
        return NextResponse.json(
          { success: false, message: "Room not found" },
          { status: 404 }
        );
      }

      if (room.currentOccupancy >= room.capacity) {
        return NextResponse.json(
          { success: false, message: "Room is at full capacity" },
          { status: 400 }
        );
      }

      // Assign the room
      userToActivate.roomId = roomId;

      // Increment room occupancy
      room.currentOccupancy += 1;
      await room.save();
    }

    await userToActivate.save();

    return NextResponse.json({
      success: true,
      message: "User activated successfully",
      user: {
        _id: userToActivate._id,
        name: userToActivate.name,
        email: userToActivate.email,
      },
    });
  } catch (error) {
    console.error("Activate user error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
