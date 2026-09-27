import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import User from "@/app/api/models/User";

// GET /api/users/filter-options - Distinct dropdown values for the admin
// users/rooms filter UI (states, companies, cities). Admin-only.
export async function GET() {
  try {
    const { isAuth, user } = await isAuthenticated();
    if (!isAuth || !user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const [states, companies, cities] = await Promise.all([
      User.distinct("state", {
        isActive: true,
        isDeleted: false,
        state: { $exists: true, $ne: "" },
      }),
      User.distinct("companyName", {
        isActive: true,
        isDeleted: false,
        companyName: { $exists: true, $ne: "" },
      }),
      User.distinct("city", {
        isActive: true,
        isDeleted: false,
        city: { $exists: true, $ne: "" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      states: states.filter(Boolean).sort(),
      companies: companies.filter(Boolean).sort(),
      cities: cities.filter(Boolean).sort(),
    });
  } catch (error) {
    console.error("Filter options error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch filter options" },
      { status: 500 }
    );
  }
}
