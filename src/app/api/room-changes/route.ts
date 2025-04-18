import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import { RoomChangeRequest } from "@/app/api/models";

// Get room change history
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

    // Determine if the user is an admin
    const isAdminUser = isAdmin(user);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Build the query
    const query: any = { isActive: true };

    // Regular users can only see their own room changes
    if (!isAdminUser) {
      query.userId = user._id;
    }

    // Get total count for pagination
    const total = await RoomChangeRequest.countDocuments(query);

    // Get room changes with populated references
    const roomChanges = await RoomChangeRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email pgId")
      .populate("oldRoomId", "roomNumber type")
      .populate("newRoomId", "roomNumber type");

    return NextResponse.json({
      success: true,
      roomChanges,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get room changes error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
