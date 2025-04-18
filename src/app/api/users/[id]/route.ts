import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import User from "@/app/api/models/User";
import Room from "@/app/api/models/Room";
import mongoose from "mongoose";

// Get a single user
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

    // Users can only view their own profile unless they are admin
    if (user._id !== params.id && !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Find user by ID
    const userData = await User.findById(params.id)
      .select("-password")
      .populate("roomId");

    if (!userData) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update a user
export async function PUT(
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

    // Only admins can update any user, normal users can only update their own profile
    if (user._id !== params.id && !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const userData = await request.json();

    // Find the user
    const userToUpdate = await User.findById(params.id);

    if (!userToUpdate) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Normal users can only update certain fields
    if (!isAdmin(user)) {
      // Filter out fields that normal users can't update
      const { name, phone } = userData;

      // Only update allowed fields
      if (name) userToUpdate.name = name;
      if (phone) userToUpdate.phone = phone;
    } else {
      // Admins can update all fields except password
      const {
        name,
        email,
        phone,
        role,
        documents,
        roomId,
        moveInDate,
        moveOutDate,
        isActive,
      } = userData;

      if (name) userToUpdate.name = name;
      if (email) userToUpdate.email = email;
      if (phone) userToUpdate.phone = phone;
      if (role) userToUpdate.role = role;
      if (documents) userToUpdate.documents = documents;
      if (roomId !== undefined) userToUpdate.roomId = roomId;
      if (moveInDate) userToUpdate.moveInDate = moveInDate;
      if (moveOutDate) userToUpdate.moveOutDate = moveOutDate;
      if (isActive !== undefined) userToUpdate.isActive = isActive;
    }

    // Update timestamps
    userToUpdate.updatedAt = new Date();

    // Save the updated user
    await userToUpdate.save();

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: userToUpdate._id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: userToUpdate.role,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a user (admin only)
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

    // Find the user
    const userToDelete = await User.findById(params.id).populate("roomId");

    if (!userToDelete) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Start a transaction to handle user deactivation and room updates
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // If user has a room assigned, update the room occupancy
      if (userToDelete.roomId) {
        const roomId =
          typeof userToDelete.roomId === "object"
            ? userToDelete.roomId._id
            : userToDelete.roomId;

        // Find and update the room
        const room = await Room.findById(roomId);
        if (room) {
          // Decrease the room occupancy
          room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
          await room.save({ session });
        }

        // Clear the room assignment from the user
        userToDelete.roomId = null;
        userToDelete.bedNumber = null;
      }

      // Mark the user as deleted and inactive
      userToDelete.isActive = false;
      userToDelete.isDeleted = true;
      userToDelete.moveOutDate = new Date();
      await userToDelete.save({ session });

      // Commit the transaction
      await session.commitTransaction();

      return NextResponse.json({
        success: true,
        message: "User deactivated successfully",
      });
    } catch (error) {
      // Abort the transaction on error
      await session.abortTransaction();
      console.error("User deactivation transaction error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to deactivate user" },
        { status: 500 }
      );
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
