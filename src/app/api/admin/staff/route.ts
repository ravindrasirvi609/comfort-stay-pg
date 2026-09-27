import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdminOrManager } from "@/app/lib/auth";
import User from "@/app/api/models/User";

// List admin + manager accounts, for assignment dropdowns etc.
export async function GET() {
  try {
    const { isAuth, user } = await isAuthenticated();
    if (!isAuth || !user || !isAdminOrManager(user)) {
      return NextResponse.json(
        { success: false, message: "Admin or manager access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const staff = await User.find(
      { role: { $in: ["admin", "manager"] }, isActive: true },
      "name email role"
    ).sort({ name: 1 });

    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error("Get staff error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}
