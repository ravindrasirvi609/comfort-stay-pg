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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const isOnNoticePeriod = searchParams.get("isOnNoticePeriod");
    const onlyActiveConfirmed = searchParams.get("onlyActiveConfirmed");

    // Build the query
    let query: any = { isDeleted: { $ne: true } };

    // Add notice period filter if provided
    if (isOnNoticePeriod === "true") {
      query.isOnNoticePeriod = true;
    }

    // Filter active and confirmed users if requested
    if (onlyActiveConfirmed === "true") {
      query.isActive = true;
      query.registrationStatus = "Approved";
    }

    // Fetch users
    const users = await User.find(query)
      .select("-password")
      .populate("roomId")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
