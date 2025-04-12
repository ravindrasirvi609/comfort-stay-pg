import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import { User } from "@/app/api/models";

// Define the same schema as in register-request

export async function GET() {
  try {
    // Check if user is authenticated and is an admin
    const authResult = await isAuthenticated();
    if (!authResult.isAuth || !authResult.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!isAdmin(authResult.user)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Get all pending registrations
    const pendingRegistrations = await User.find(
      { registrationStatus: "Pending" },
      { password: 0 }
    );

    return NextResponse.json({ success: true, data: pendingRegistrations });
  } catch (error) {
    console.error("Error fetching pending registrations:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
