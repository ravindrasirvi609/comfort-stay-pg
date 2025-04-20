import { NextRequest, NextResponse } from "next/server";
import VisitRequest from "@/app/api/models/VisitRequest";
import Notification from "@/app/api/models/Notification";
import User from "@/app/api/models/User";
import { connectToDatabase } from "@/app/lib/db";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { name, email, phone, preferredDate, preferredTime, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { success: false, message: "Required fields are missing" },
        { status: 400 }
      );
    }

    // Create new visit request
    const newVisitRequest = await VisitRequest.create({
      name,
      email,
      phone,
      preferredDate,
      preferredTime,
      message,
    });

    // Find all admin users to notify them
    const adminUsers = await User.find({ role: "admin" });

    // Create notifications for each admin user
    const notificationPromises = adminUsers.map((admin) => {
      return Notification.create({
        userId: admin._id,
        title: "New Visit Request",
        message: `${name} has requested to visit on ${new Date(preferredDate).toLocaleDateString()} at ${preferredTime}`,
        type: "Visit",
        relatedId: newVisitRequest._id,
        relatedModel: "VisitRequest",
        isRead: false,
        isActive: true,
      });
    });

    await Promise.all(notificationPromises);

    return NextResponse.json(
      {
        success: true,
        message:
          "Your visit request has been submitted successfully. We'll contact you to confirm the details.",
        visitRequest: newVisitRequest,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Visit request error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to submit visit request",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    // Build filter criteria
    const filter: any = { isActive: true };
    if (status) {
      filter.status = status;
    }

    // Count total documents
    const total = await VisitRequest.countDocuments(filter);

    // Get visit requests with pagination
    const visitRequests = await VisitRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        visitRequests,
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
    console.error("Get visit requests error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to get visit requests",
      },
      { status: 500 }
    );
  }
}
