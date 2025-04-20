import { NextRequest, NextResponse } from "next/server";
import Subscriber from "@/app/api/models/Subscriber";
import Notification from "@/app/api/models/Notification";
import User from "@/app/api/models/User";
import { connectToDatabase } from "@/app/lib/db";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscriber = await Subscriber.findOne({
      email,
      isActive: true,
    });

    if (existingSubscriber) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is already subscribed to our newsletter",
        },
        { status: 400 }
      );
    }

    // Create new subscriber or reactivate existing one
    let subscriber = await Subscriber.findOne({ email });

    if (subscriber) {
      // Reactivate existing subscriber
      subscriber.isActive = true;
      subscriber.subscriptionDate = new Date();
      await subscriber.save();
    } else {
      // Create new subscriber
      subscriber = await Subscriber.create({
        email,
        subscriptionDate: new Date(),
      });
    }

    // Find all admin users to notify them
    const adminUsers = await User.find({ role: "admin" });

    // Create notifications for each admin user
    const notificationPromises = adminUsers.map((admin) => {
      return Notification.create({
        userId: admin._id,
        title: "New Newsletter Subscriber",
        message: `${email} has subscribed to the newsletter.`,
        type: "Subscription",
        relatedId: subscriber._id,
        relatedModel: "Subscriber",
        isRead: false,
        isActive: true,
      });
    });

    await Promise.all(notificationPromises);

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for subscribing to our newsletter!",
        subscriber,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Subscriber error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to subscribe" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const skip = (page - 1) * limit;

    // Only get active subscribers
    const filter = { isActive: true };

    // Count total documents
    const total = await Subscriber.countDocuments(filter);

    // Get subscribers with pagination
    const subscribers = await Subscriber.find(filter)
      .sort({ subscriptionDate: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        subscribers,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get subscribers error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to get subscribers" },
      { status: 500 }
    );
  }
}
