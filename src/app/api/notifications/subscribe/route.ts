import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import path from "path";

// Simple file-based storage for push subscriptions
const SUBSCRIPTIONS_DIR = path.join(process.cwd(), "data");
const SUBSCRIPTIONS_FILE = path.join(SUBSCRIPTIONS_DIR, "subscriptions.json");

async function saveSubscription(subscription: any) {
  try {
    // Create directory if it doesn't exist
    await mkdir(SUBSCRIPTIONS_DIR, { recursive: true });

    // Read existing subscriptions or create empty array
    let subscriptions = [];
    try {
      const data = await readFile(SUBSCRIPTIONS_FILE, "utf8");
      subscriptions = JSON.parse(data);
    } catch (err) {
      // File doesn't exist yet, that's ok
    }

    // Check if this subscription already exists
    const exists = subscriptions.some(
      (sub: any) => sub.endpoint === subscription.endpoint
    );

    if (!exists) {
      // Add with timestamp
      subscriptions.push({
        ...subscription,
        createdAt: new Date().toISOString(),
      });

      // Save back to file
      await writeFile(
        SUBSCRIPTIONS_FILE,
        JSON.stringify(subscriptions, null, 2)
      );
    }

    return true;
  } catch (error) {
    console.error("Error saving subscription:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { subscription } = await request.json();

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription data is required" },
        { status: 400 }
      );
    }

    const success = await saveSubscription(subscription);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to save subscription" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
