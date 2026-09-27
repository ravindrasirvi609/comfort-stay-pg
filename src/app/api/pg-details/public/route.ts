import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import PGDetails from "@/app/models/PGDetails";
import { isAuthenticated } from "@/app/lib/auth";

export async function GET() {
  try {
    const { isAuth } = await isAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    await connectToDatabase();
    const pgDetails = await PGDetails.findOne();

    // Return only safe, non-sensitive fields (no bank/payment details, no wifi password)
    const safeDetails = {
      name: pgDetails?.name ?? "Comfort Stay PG",
      contactPhone: pgDetails?.contactPhone ?? "",
      emergencyContacts: pgDetails?.emergencyContacts ?? [],
      wifiDetails: {
        name: pgDetails?.wifiDetails?.name ?? "",
        note: pgDetails?.wifiDetails?.note ?? "",
        // password intentionally omitted
      },
      noticePolicy: {
        minNoticeDays: pgDetails?.noticePolicy?.minNoticeDays ?? 15,
        refundAmount: pgDetails?.noticePolicy?.refundAmount ?? 1500,
      },
    };

    return NextResponse.json({ success: true, pgDetails: safeDetails });
  } catch (error) {
    console.error("Error fetching public PG details:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch PG details" }, { status: 500 });
  }
}
