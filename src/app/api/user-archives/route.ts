import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated } from "@/app/lib/auth";
import { isAdmin } from "@/app/utils/roleCheck";
import UserArchive from "@/app/api/models/UserArchive";

// Get all archives with optional filtering
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

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period");
    const reason = searchParams.get("reason");
    const search = searchParams.get("search");

    // Construct filter query
    const query: any = {};

    // Filter by archive date period
    if (period) {
      const now = new Date();
      let startDate = new Date();

      switch (period) {
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "6months":
          startDate.setMonth(now.getMonth() - 6);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      query.archiveDate = { $gte: startDate, $lte: now };
    }

    // Filter by reason
    if (reason && reason !== "all") {
      query.archiveReason = reason;
    }

    // Search by name, email, or phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { pgId: { $regex: search, $options: "i" } },
      ];
    }

    // Fetch all archives with optional filters
    const archives = await UserArchive.find(query)
      .sort({ archiveDate: -1 }) // Sort by most recent first
      .select("-password") // Exclude password
      .lean();

    return NextResponse.json({
      success: true,
      archives,
    });
  } catch (error: any) {
    console.error("Error fetching archives:", error);
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

// Get a specific archive by ID
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

    // Get the archive ID from request body
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Archive ID is required" },
        { status: 400 }
      );
    }

    // Find the specific archive by ID
    const archive = await UserArchive.findById(id)
      .select("-password") // Exclude password
      .lean();

    if (!archive) {
      return NextResponse.json(
        { success: false, message: "Archive not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      archive,
    });
  } catch (error: any) {
    console.error("Error fetching archive:", error);
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
