import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

// Simple file-based storage for push subscriptions
const SUBSCRIPTIONS_FILE = path.join(
  process.cwd(),
  "data",
  "subscriptions.json"
);

async function removeSubscription(endpoint: string) {
  try {
    // Read existing subscriptions
    let subscriptions = [];
    try {
      const data = await readFile(SUBSCRIPTIONS_FILE, "utf8");
      subscriptions = JSON.parse(data);
    } catch (err) {
      // File doesn't exist, nothing to remove
      return 0;
    }

    // Filter out the subscription to remove
    const initialLength = subscriptions.length;
    const filtered = subscriptions.filter(
      (sub: any) => sub.endpoint !== endpoint
    );

    // If no subscriptions were removed, return 0
    if (filtered.length === initialLength) {
      return 0;
    }

    // Save back to file
    await writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(filtered, null, 2));

    // Return number of removed subscriptions
    return initialLength - filtered.length;
  } catch (error) {
    console.error("Error removing subscription:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint is required" },
        { status: 400 }
      );
    }

    try {
      const removed = await removeSubscription(endpoint);

      if (removed === 0) {
        return NextResponse.json(
          { message: "Subscription not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json(
        { error: "Failed to remove subscription" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
