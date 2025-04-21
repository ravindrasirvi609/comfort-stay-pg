import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import PushSubscription from "@/app/api/models/PushSubscription";

export async function POST(request: NextRequest) {
  console.log("Subscribe API called");

  try {
    const { subscription, segment } = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Valid subscription object is required" },
        { status: 400 }
      );
    }

    console.log("Received subscription:", subscription.endpoint);

    // Connect to the database
    await connectToDatabase();

    // Check if this subscription already exists
    const existingSubscription = await PushSubscription.findOne({
      endpoint: subscription.endpoint,
    });

    if (existingSubscription) {
      console.log("Subscription already exists, updating...");

      // Update the existing subscription with any new data
      existingSubscription.keys = subscription.keys;
      if (segment) existingSubscription.segment = segment;
      if (subscription.expirationTime)
        existingSubscription.expirationTime = subscription.expirationTime;

      await existingSubscription.save();

      return NextResponse.json({
        success: true,
        message: "Subscription updated successfully",
        isNew: false,
      });
    }

    // Create new subscription
    const newSubscription = new PushSubscription({
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime || null,
      keys: subscription.keys,
      segment: segment || "default",
      userAgent: request.headers.get("user-agent") || undefined,
    });

    // Save to database
    await newSubscription.save();
    console.log("New subscription saved to database");

    // Show a confirmation notification if possible
    return NextResponse.json({
      success: true,
      message: "Subscription added successfully",
      isNew: true,
    });
  } catch (error: any) {
    console.error("Subscription error:", error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({
        success: true,
        message: "Subscription already exists",
        isNew: false,
      });
    }

    return NextResponse.json(
      { error: `Subscription error: ${error.message}` },
      { status: 500 }
    );
  }
}
