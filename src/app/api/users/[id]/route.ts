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
    console.log("Update request data:", JSON.stringify(userData));

    // Find the user with string ID conversion
    const userId = params.id.toString();
    const userToUpdate = await User.findById(userId);

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
        fathersName,
        permanentAddress,
        city,
        state,
        guardianMobileNumber,
        validIdType,
        companyName,
        companyAddress,
        depositFees,
        validIdPhoto,
        profileImage,
        documents,
        pgId,
        roomId,
        bedNumber,
        moveInDate,
        moveOutDate,
        isActive,
      } = userData;

      if (name) userToUpdate.name = name;
      if (email) userToUpdate.email = email;
      if (phone) userToUpdate.phone = phone;
      if (fathersName) userToUpdate.fathersName = fathersName;
      if (permanentAddress) userToUpdate.permanentAddress = permanentAddress;
      if (city) userToUpdate.city = city;
      if (state) userToUpdate.state = state;
      if (guardianMobileNumber)
        userToUpdate.guardianMobileNumber = guardianMobileNumber;
      if (validIdType) userToUpdate.validIdType = validIdType;
      if (companyName !== undefined) userToUpdate.companyName = companyName;
      if (companyAddress !== undefined)
        userToUpdate.companyAddress = companyAddress;
      if (depositFees !== undefined) userToUpdate.depositFees = depositFees;
      if (validIdPhoto) userToUpdate.validIdPhoto = validIdPhoto;
      if (profileImage) userToUpdate.profileImage = profileImage;
      if (documents) userToUpdate.documents = documents;
      if (pgId) userToUpdate.pgId = pgId;
      if (roomId !== undefined) userToUpdate.roomId = roomId;
      if (bedNumber !== undefined) userToUpdate.bedNumber = bedNumber;
      if (moveInDate) userToUpdate.moveInDate = moveInDate;
      if (moveOutDate) userToUpdate.moveOutDate = moveOutDate;
      if (isActive !== undefined) userToUpdate.isActive = isActive;
    }

    // Update timestamps
    userToUpdate.updatedAt = new Date();

    // Save the updated user and handle potential mongoose validation errors
    try {
      const savedUser = await userToUpdate.save();
      console.log("User updated successfully:", savedUser._id);

      return NextResponse.json({
        success: true,
        message: "User updated successfully",
        user: {
          _id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role,
        },
      });
    } catch (saveError: any) {
      console.error("Error saving user:", saveError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to save user data",
          error: saveError.message,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
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
