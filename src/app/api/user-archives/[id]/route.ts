import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import UserArchive from "@/app/api/models/UserArchive";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // First await the params to get the id
    const params = await props.params;

    // Check if user is authenticated
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Only admins can access archive details
    if (!isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Find the archive by ID - now using params.id after awaiting props.params
    const archive = await UserArchive.findById(params.id);

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
  } catch (error) {
    console.error("Get archive error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
