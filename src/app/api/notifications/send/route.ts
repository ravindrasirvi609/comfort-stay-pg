import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import PushSubscription from "@/app/api/models/PushSubscription";
import webpush from "web-push";

// Configure web-push with your VAPID keys
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || "";

if (!publicVapidKey || !privateVapidKey) {
  console.warn("VAPID keys are not set. Push notifications will not work.");
} else {
  webpush.setVapidDetails(
    "mailto:" + (process.env.CONTACT_EMAIL || "contact@comfort-stay-pg.com"),
    publicVapidKey,
    privateVapidKey
  );
}

export async function POST(request: NextRequest) {
  console.log("Notification send API called");

  // This endpoint should be protected by authentication in a real app
  try {
    const { title, body, url, segment } = await request.json();
    console.log("Notification payload:", { title, body, url, segment });

    if (!title || !body) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Build query for subscriptions
    const query = segment ? { segment } : {};

    // Get subscriptions from database
    const subscriptions = await PushSubscription.find(query);
    console.log(`Found ${subscriptions.length} subscriptions`);

    if (!subscriptions.length) {
      console.log("No subscriptions found");

      return NextResponse.json(
        {
          warning:
            "No active subscriptions found. Please ensure users have enabled notifications.",
          testMode: true,
        },
        { status: 200 }
      );
    }

    // Send notifications to all matching subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          const payload = JSON.stringify({
            title,
            body,
            url,
            timestamp: new Date().toISOString(),
          });

          await webpush.sendNotification(subscription, payload);
          return {
            success: true,
            endpoint: subscription.endpoint,
          };
        } catch (error: any) {
          // Check for subscription expiration or invalid subscription
          if (error.statusCode === 404 || error.statusCode === 410) {
            // Remove expired subscription
            console.log(
              `Removing invalid subscription: ${subscription.endpoint}`
            );
            await PushSubscription.deleteOne({ _id: subscription._id });
          }

          return {
            success: false,
            endpoint: subscription.endpoint,
            error: error.message,
            statusCode: error.statusCode,
          };
        }
      })
    );

    // Count successes and failures
    const succeeded = results.filter(
      (r) => r.status === "fulfilled" && (r.value as any).success
    ).length;
    const failed = results.length - succeeded;

    return NextResponse.json({
      message: `Sent ${succeeded} notifications, ${failed} failed`,
      results: results.map((r) =>
        r.status === "fulfilled" ? r.value : r.reason
      ),
    });
  } catch (error: any) {
    console.error("Error sending notifications:", error);
    return NextResponse.json(
      { error: "Failed to send notifications: " + error.message },
      { status: 500 }
    );
  }
}
