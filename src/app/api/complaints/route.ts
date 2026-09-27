import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin, isManager } from "@/app/lib/auth";
import Complaint from "@/app/api/models/Complaint";
import User from "@/app/api/models/User";
import Notification from "@/app/api/models/Notification";

/** Escape special regex characters in a user-supplied search string */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Get all complaints
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // This is just to ensure User model is registered
    await User.findOne({});

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim() || "";

    let complaints;

    // If admin or manager, get all complaints
    if (isAdmin(user) || isManager(user)) {
      let page = parseInt(url.searchParams.get("page") || "1", 10);
      if (!Number.isFinite(page) || page < 1) page = 1;
      let limit = parseInt(url.searchParams.get("limit") || "10", 10);
      if (!Number.isFinite(limit) || limit < 1) limit = 10;

      const query: Record<string, unknown> = { isActive: true };

      if (search) {
        const regex = new RegExp(escapeRegex(search), "i");

        // Two-step search: userId is a populated ref, so first find matching
        // users by name/pgId, then match complaints by title OR those user IDs.
        const matchingUsers = await User.find(
          { $or: [{ name: regex }, { pgId: regex }] },
          "_id"
        );
        const matchingUserIds = matchingUsers.map((u) => u._id);

        query.$or = [{ title: regex }, { userId: { $in: matchingUserIds } }];
      }

      const total = await Complaint.countDocuments(query);
      const totalPages = Math.max(Math.ceil(total / limit), 1);
      const skip = (page - 1) * limit;

      complaints = await Complaint.find(query)
        .populate("userId", "name email pgId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return NextResponse.json({
        success: true,
        complaints,
        pagination: { total, page, limit, totalPages },
      });
    } else {
      // For normal users, only get their complaints
      const query: Record<string, unknown> = {
        userId: user._id,
        isActive: true,
      };

      if (search) {
        query.title = { $regex: escapeRegex(search), $options: "i" };
      }

      complaints = await Complaint.find(query).sort({ createdAt: -1 });

      return NextResponse.json({
        success: true,
        complaints,
      });
    }
  } catch (error) {
    console.error("Get complaints error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new complaint
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Ensure User model is registered
    await User.findOne({});

    const { title, description, category, priority } = await request.json();

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: "Please provide all required fields" },
        { status: 400 }
      );
    }

    // Create new complaint
    const newComplaint = new Complaint({
      userId: user._id,
      title,
      description,
      category,
      priority,
      status: "Open",
    });

    await newComplaint.save();

    // Create notification for all active admins
    const adminUsers = await User.find({ role: "admin", isActive: true });
    await Promise.all(
      adminUsers.map((admin) =>
        Notification.create({
          userId: admin._id,
          title: 'New Complaint Submitted',
          message: `${user.name || 'A user'} has submitted a new complaint: "${title}"`,
          type: 'Complaint',
          isRead: false,
          isActive: true,
          relatedId: newComplaint._id,
          relatedModel: 'Complaint',
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Complaint submitted successfully",
      complaint: newComplaint,
    });
  } catch (error) {
    console.error("Create complaint error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
