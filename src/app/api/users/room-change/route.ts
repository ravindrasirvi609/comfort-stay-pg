import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import { User, Room, RoomChangeRequest } from "@/app/api/models";
import mongoose from "mongoose";

// Handle room change request (admin only)
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

    // Check if user is admin
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

    // Get data from request
    const { userId, newRoomId } = await request.json();

    if (!userId || !newRoomId) {
      return NextResponse.json(
        { success: false, message: "User ID and new room ID are required" },
        { status: 400 }
      );
    }

    // Get the user with their room details
    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is already in a room
    if (!userToUpdate.roomId) {
      return NextResponse.json(
        { success: false, message: "User doesn't have a room assigned yet" },
        { status: 400 }
      );
    }

    // Check if the new room exists and is available
    const newRoom = await Room.findById(newRoomId);

    if (!newRoom) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    // Check if new room has space
    if (newRoom.currentOccupancy >= newRoom.capacity) {
      return NextResponse.json(
        {
          success: false,
          message: "The selected room is already fully occupied",
        },
        { status: 400 }
      );
    }

    // Get the current room
    const currentRoom = await Room.findById(userToUpdate.roomId);

    if (!currentRoom) {
      return NextResponse.json(
        { success: false, message: "Current room not found" },
        { status: 404 }
      );
    }

    // Find an available bed number in the new room
    const usersInNewRoom = await User.find({
      roomId: newRoom._id,
      isActive: true,
    }).select("bedNumber");

    const occupiedBeds = usersInNewRoom.map((u) => u.bedNumber);
    let newBedNumber = null;

    // Find the first available bed number
    for (let i = 1; i <= newRoom.capacity; i++) {
      if (!occupiedBeds.includes(i)) {
        newBedNumber = i;
        break;
      }
    }

    if (newBedNumber === null) {
      return NextResponse.json(
        { success: false, message: "No available beds in the selected room" },
        { status: 400 }
      );
    }

    // Start a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update current room occupancy
      currentRoom.currentOccupancy -= 1;
      await currentRoom.save({ session });

      // Update new room occupancy
      newRoom.currentOccupancy += 1;
      await newRoom.save({ session });

      // Store the old room details for record-keeping
      const oldRoomId = userToUpdate.roomId;
      const oldBedNumber = userToUpdate.bedNumber || 0;

      // Update user's room assignment
      userToUpdate.roomId = newRoom._id;
      userToUpdate.bedNumber = newBedNumber;
      await userToUpdate.save({ session });

      // Create a record of the room change
      const roomChangeRecord = new RoomChangeRequest({
        userId: userToUpdate._id,
        oldRoomId: oldRoomId,
        newRoomId: newRoom._id,
        oldBedNumber: oldBedNumber,
        newBedNumber: newBedNumber,
        status: "Completed",
        requestedAt: new Date(),
        completedAt: new Date(),
        isActive: true,
      });

      await roomChangeRecord.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({
        success: true,
        message: "Room change successful",
        data: {
          roomNumber: newRoom.roomNumber,
          roomType: newRoom.type,
          bedNumber: newBedNumber,
        },
      });
    } catch (error) {
      // Abort the transaction on error
      await session.abortTransaction();
      session.endSession();

      console.error("Room change transaction error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to change room" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Room change error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
