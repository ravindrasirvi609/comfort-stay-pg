import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import webpush from "web-push";

// Simple file-based storage for push subscriptions
const SUBSCRIPTIONS_FILE = path.join(
  process.cwd(),
  "data",
  "subscriptions.json"
);

// Configure web-push with your VAPID keys
// You'll need to generate these keys and store them in your environment variables
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

async function getSubscriptions(segment?: string) {
  try {
    // Read existing subscriptions
    let subscriptions = [];
    try {
      const data = await readFile(SUBSCRIPTIONS_FILE, "utf8");
      subscriptions = JSON.parse(data);
    } catch (err) {
      // File doesn't exist, return empty array
      return [];
    }

    // Filter by segment if provided
    if (segment) {
      return subscriptions.filter((sub: any) => sub.segment === segment);
    }

    return subscriptions;
  } catch (error) {
    console.error("Error getting subscriptions:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  // This endpoint should be protected by authentication in a real app
  try {
    const { title, body, url, segment } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      );
    }

    // Get subscriptions
    const subscriptions = await getSubscriptions(segment);

    if (!subscriptions.length) {
      return NextResponse.json(
        { message: "No subscriptions found" },
        { status: 404 }
      );
    }

    // Send notifications to all matching subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub: any) => {
        try {
          const payload = JSON.stringify({
            title,
            body,
            url,
            // You can add additional data here
            timestamp: new Date().toISOString(),
          });

          await webpush.sendNotification(sub, payload);
          return { success: true, endpoint: sub.endpoint };
        } catch (error: any) {
          return {
            success: false,
            endpoint: sub.endpoint,
            error: error.message,
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
      results,
    });
  } catch (error) {
    console.error("Error sending notifications:", error);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 }
    );
  }
}
