import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import Payment from "@/app/api/models/Payment";

// GET /api/payments/dues - Get users with unpaid dues
export async function GET() {
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

    // Find all unpaid payments
    const unpaidPayments = await Payment.find({
      status: { $in: ["Due", "Overdue"] },
      isActive: true,
    }).distinct("userId");

    return NextResponse.json({
      success: true,
      usersWithDues: unpaidPayments,
    });
  } catch (error) {
    console.error("Get users with dues error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
