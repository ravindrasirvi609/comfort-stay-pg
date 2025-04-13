import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import User from "@/app/api/models/User";

// Get a single user
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
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
    const userData = await User.findById(params.id).select("-password");

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
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
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
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
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
    const userToDelete = await User.findById(params.id);

    if (!userToDelete) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Instead of deleting completely, deactivate the user
    userToDelete.isActive = false;
    userToDelete.moveOutDate = new Date();
    await userToDelete.save();

    return NextResponse.json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
