import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import PushSubscription from "@/app/api/models/PushSubscription";
import webpush from "web-push";

// Configure web-push with your VAPID keys
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || "";

// Log VAPID keys on startup (partial for security)
if (publicVapidKey) {
  console.log(
    "VAPID public key is configured:",
    `${publicVapidKey.substring(0, 10)}...`
  );
} else {
  console.warn(
    "VAPID public key is not set. Push notifications will not work."
  );
}

if (privateVapidKey) {
  console.log("VAPID private key is configured");
} else {
  console.warn(
    "VAPID private key is not set. Push notifications will not work."
  );
}

// Configure web-push
if (publicVapidKey && privateVapidKey) {
  try {
    webpush.setVapidDetails(
      "mailto:" + (process.env.CONTACT_EMAIL || "contact@comfort-stay-pg.com"),
      publicVapidKey,
      privateVapidKey
    );
    console.log("Web-push configured successfully");
  } catch (error) {
    console.error("Error configuring web-push:", error);
  }
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

    // Make sure VAPID keys are configured
    if (!publicVapidKey || !privateVapidKey) {
      return NextResponse.json(
        {
          error:
            "VAPID keys are not configured. Cannot send push notifications.",
        },
        { status: 500 }
      );
    }

    // Send notifications to all matching subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          console.log(
            `Sending notification to: ${subscription.endpoint.substring(0, 30)}...`
          );

          // Prepare payload for push notification
          const payload = JSON.stringify({
            title,
            body,
            url: url || "/",
            icon: "/icons/icon-192x192.png",
            badge: "/icons/maskable-icon.png",
            timestamp: new Date().toISOString(),
          });

          // Send the push notification
          const pushResult = await webpush.sendNotification(
            subscription,
            payload
          );

          console.log("Push notification sent successfully:", {
            statusCode: pushResult.statusCode,
          });

          return {
            success: true,
            endpoint: subscription.endpoint,
            statusCode: pushResult.statusCode,
            timestamp: new Date().toISOString(),
          };
        } catch (error: any) {
          console.error("Push notification error details:", {
            statusCode: error.statusCode,
            message: error.message,
            endpoint: subscription.endpoint.substring(0, 30) + "...",
            stack: error.stack ? error.stack.split("\n")[0] : "No stack trace",
          });

          // Handle expired or invalid subscriptions
          if (error.statusCode === 404 || error.statusCode === 410) {
            console.log(
              `Removing invalid subscription: ${subscription.endpoint.substring(0, 30)}...`
            );
            await PushSubscription.deleteOne({ _id: subscription._id });
          }

          return {
            success: false,
            endpoint: subscription.endpoint,
            error: error.message,
            statusCode: error.statusCode || 500,
            timestamp: new Date().toISOString(),
          };
        }
      })
    );

    // Count successes and failures
    const succeeded = results.filter(
      (r) => r.status === "fulfilled" && (r.value as any).success
    ).length;
    const failed = results.length - succeeded;

    // If some notifications failed, but some succeeded
    if (failed > 0 && succeeded > 0) {
      console.log(
        `Some notifications failed (${failed}), but ${succeeded} were sent successfully`
      );
    } else if (failed > 0) {
      console.error(`All ${failed} notifications failed to send`);
    } else {
      console.log(`All ${succeeded} notifications sent successfully`);
    }

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
