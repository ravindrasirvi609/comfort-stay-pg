import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import PushSubscription from "@/app/api/models/PushSubscription";

export async function POST(request: NextRequest) {
  console.log("Unsubscribe API called");

  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: "Subscription endpoint is required" },
        { status: 400 }
      );
    }

    console.log("Unsubscribe request for endpoint:", endpoint);

    // Connect to the database
    await connectToDatabase();

    // Delete the subscription
    const result = await PushSubscription.deleteOne({ endpoint });

    if (result.deletedCount > 0) {
      console.log("Subscription deleted successfully");
      return NextResponse.json({
        success: true,
        message: "Subscription removed successfully",
      });
    } else {
      console.log("Subscription not found");
      return NextResponse.json({
        success: false,
        message: "Subscription not found",
      });
    }
  } catch (error: any) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: `Unsubscribe error: ${error.message}` },
      { status: 500 }
    );
  }
}
