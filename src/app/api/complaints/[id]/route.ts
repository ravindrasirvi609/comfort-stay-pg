import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import Complaint from "@/app/api/models/Complaint";
import User from "@/app/api/models/User";

// Get a single complaint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Find complaint by ID
    const complaint = await Complaint.findById(id).populate(
      "userId",
      "name email pgId"
    );

    if (!complaint) {
      return NextResponse.json(
        { success: false, message: "Complaint not found" },
        { status: 404 }
      );
    }

    // Normal users can only see their own complaints
    if (!isAdmin(user) && complaint.userId._id.toString() !== user._id) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error("Get complaint error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update a complaint status (admin only for certain fields)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Find the complaint
    const complaintToUpdate = await Complaint.findById(id);

    if (!complaintToUpdate) {
      return NextResponse.json(
        { success: false, message: "Complaint not found" },
        { status: 404 }
      );
    }

    // Only owner of complaint or admin can update
    if (complaintToUpdate.userId.toString() !== user._id && !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const updateData = await request.json();

    // If normal user, they can only update title and description
    if (!isAdmin(user)) {
      const { title, description } = updateData;

      // Only if complaint is still 'Open'
      if (complaintToUpdate.status !== "Open") {
        return NextResponse.json(
          {
            success: false,
            message: "Cannot update complaint that is in progress or resolved",
          },
          { status: 400 }
        );
      }

      if (title) complaintToUpdate.title = title;
      if (description) complaintToUpdate.description = description;
    } else {
      // Admins can update all fields
      const { status, assignedTo } = updateData;

      if (status) {
        complaintToUpdate.status = status;

        // If status is changed to resolved, set resolvedAt
        if (status === "Resolved") {
          complaintToUpdate.resolvedAt = new Date();
        }
      }

      if (assignedTo) complaintToUpdate.assignedTo = assignedTo;
    }

    // Save the updated complaint
    await complaintToUpdate.save();

    return NextResponse.json({
      success: true,
      message: "Complaint updated successfully",
      complaint: complaintToUpdate,
    });
  } catch (error) {
    console.error("Update complaint error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a complaint (admin or owner)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Find the complaint
    const complaintToDelete = await Complaint.findById(id);

    if (!complaintToDelete) {
      return NextResponse.json(
        { success: false, message: "Complaint not found" },
        { status: 404 }
      );
    }

    // Only owner of complaint or admin can delete
    if (complaintToDelete.userId.toString() !== user._id && !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // Soft delete the complaint
    complaintToDelete.isActive = false;
    await complaintToDelete.save();

    return NextResponse.json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    console.error("Delete complaint error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
