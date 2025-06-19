import { NextRequest, NextResponse } from "next/server";
import ContactInquiry from "@/app/api/models/ContactInquiry";
import Notification from "@/app/api/models/Notification";
import User from "@/app/api/models/User";
import { connectToDatabase } from "@/app/lib/db";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { name, email, phone, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Create new contact inquiry
    const newInquiry = await ContactInquiry.create({
      name,
      email,
      phone,
      message,
    });

    // Send confirmation email to the user
    const { sendContactInquiryConfirmationEmail } = await import(
      "@/app/lib/email"
    );
    await sendContactInquiryConfirmationEmail(name, email, phone, message);

    // Find all admin users to notify them
    const adminUsers = await User.find({ role: "admin" });

    // Create notifications for each admin user
    const notificationPromises = adminUsers.map((admin) => {
      return Notification.create({
        userId: admin._id,
        title: "New Contact Inquiry",
        message: `${name} has submitted a new contact inquiry.`,
        type: "Contact",
        relatedId: newInquiry._id,
        relatedModel: "ContactInquiry",
        isRead: false,
        isActive: true,
      });
    });

    // Also create a notification for the hardcoded admin ID
    notificationPromises.push(
      Notification.create({
        userId: "admin_id_123456789", // Hardcoded admin ID
        title: "New Contact Inquiry",
        message: `${name} has submitted a new contact inquiry.`,
        type: "Contact",
        relatedId: newInquiry._id,
        relatedModel: "ContactInquiry",
        isRead: false,
        isActive: true,
      })
    );

    await Promise.all(notificationPromises);

    return NextResponse.json(
      {
        success: true,
        message:
          "Your inquiry has been submitted successfully. We'll get back to you soon.",
        inquiry: newInquiry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact inquiry error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to submit inquiry";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const responded = searchParams.get("responded");

    const skip = (page - 1) * limit;

    // Build filter criteria
    const filter: { isActive: boolean; respondedTo?: boolean } = {
      isActive: true,
    };
    if (responded !== null) {
      filter.respondedTo = responded === "true";
    }

    // Count total documents
    const total = await ContactInquiry.countDocuments(filter);

    // Get inquiries with pagination
    const inquiries = await ContactInquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        inquiries,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get contact inquiries error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to get inquiries";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
