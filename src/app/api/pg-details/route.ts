import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import PGDetails from "@/app/models/PGDetails";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";

// GET endpoint to fetch PG details
export async function GET() {
  try {
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Find PG details (usually there would be only one document for a PG admin)
    let pgDetails = await PGDetails.findOne();

    // If no PG details exist yet, return a default template
    if (!pgDetails) {
      pgDetails = {
        name: "Comfort Stay PG",
        address: "",
        city: "",
        state: "",
        pincode: "",
        contactEmail: "",
        contactPhone: "",
        description: "",
        rules: [
          "No smoking inside the building",
          "Guests allowed only until 9 PM",
        ],
        features: {
          wifi: true,
          food: true,
          laundry: false,
          cleaning: true,
          parking: false,
          security: true,
        },
        paymentDetails: {
          bankName: "",
          accountNumber: "",
          ifscCode: "",
          upiId: "",
        },
        notificationSettings: {
          emailNotifications: true,
          smsNotifications: false,
          paymentReminders: true,
          maintenanceAlerts: true,
        },
      };
    }

    return NextResponse.json({ success: true, pgDetails });
  } catch (error) {
    console.error("Error fetching PG details:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch PG details" },
      { status: 500 }
    );
  }
}

// POST endpoint to update PG details
export async function POST(req: Request) {
  try {
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { pgDetails } = body;

    await connectToDatabase();

    // Update or create PG details
    const updatedDetails = await PGDetails.findOneAndUpdate(
      {}, // Empty filter to match any document
      pgDetails,
      { new: true, upsert: true } // Create if doesn't exist, return updated document
    );

    return NextResponse.json({
      success: true,
      message: "PG details updated successfully",
      pgDetails: updatedDetails,
    });
  } catch (error) {
    console.error("Error updating PG details:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update PG details" },
      { status: 500 }
    );
  }
}
