import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import User from "@/app/api/models/User";
import Payment from "@/app/api/models/Payment";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const { isAuth, user } = await isAuthenticated();
    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Admin authorization check
    if (!isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const building = searchParams.get("building") || "";
    const status = searchParams.get("status") || "active";

    // Validate month and year
    if (!month || !year) {
      return NextResponse.json(
        {
          success: false,
          message: "Month and year are required parameters",
        },
        { status: 400 }
      );
    }

    // Format month-year for payment search (e.g., "January 2024")
    const monthYear = `${month} ${year}`;

    // Build user query - only active users with rooms assigned
    const userQuery: any = {
      registrationStatus: "Approved",
      isActive: status === "active",
      roomId: { $ne: null },
    };

    // Add search filter
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { pgId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Get all approved users with room assignments
    const allUsers = await User.find(userQuery)
      .populate("roomId", "roomNumber building floor type price")
      .select("_id name email phone pgId roomId bedNumber joinDate")
      .lean();

    // Map price to rentAmount for consistency with frontend
    const allUsersWithRentAmount = allUsers.map((user: any) => ({
      ...user,
      roomId: user.roomId
        ? {
            ...user.roomId,
            rentAmount: user.roomId.price,
          }
        : null,
    }));

    // Filter by building if specified
    let filteredUsers = allUsersWithRentAmount;
    if (building) {
      filteredUsers = allUsersWithRentAmount.filter(
        (user: any) => user.roomId?.building === building
      );
    }

    // Get all payment records for the specified month
    const paymentsInMonth = await Payment.find({
      months: monthYear,
      isActive: true,
    })
      .select("userId")
      .lean();

    // Create a Set of user IDs who have made payments
    const paidUserIds = new Set(
      paymentsInMonth.map((payment: any) => payment.userId.toString())
    );

    // Filter users who don't have payment entries
    const usersWithoutPayments = filteredUsers.filter(
      (user: any) => !paidUserIds.has(user._id.toString())
    );

    // Calculate pagination
    const totalCount = usersWithoutPayments.length;
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    // Paginate results
    const paginatedUsers = usersWithoutPayments.slice(skip, skip + limit);

    // Calculate summary statistics
    const summary = {
      totalUsersWithoutPayment: totalCount,
      totalActiveUsers: allUsersWithRentAmount.length,
      percentageWithoutPayment:
        allUsersWithRentAmount.length > 0
          ? ((totalCount / allUsersWithRentAmount.length) * 100).toFixed(2)
          : 0,
      monthYear,
    };

    return NextResponse.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
      },
      summary,
    });
  } catch (error: any) {
    console.error("Error fetching users without payments:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users without payments",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Export monthly summary
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const { isAuth, user } = await isAuthenticated();
    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Admin authorization check
    if (!isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { month, year } = body;

    if (!month || !year) {
      return NextResponse.json(
        {
          success: false,
          message: "Month and year are required",
        },
        { status: 400 }
      );
    }

    const monthYear = `${month} ${year}`;

    // Get all active users with rooms
    const allUsers = await User.find({
      registrationStatus: "Approved",
      isActive: true,
      roomId: { $ne: null },
    })
      .populate("roomId", "roomNumber building floor price")
      .select("name email phone pgId roomId bedNumber")
      .lean();

    // Map price to rentAmount for consistency
    const allUsersWithRentAmount = allUsers.map((user: any) => ({
      ...user,
      roomId: user.roomId
        ? {
            ...user.roomId,
            rentAmount: user.roomId.price,
          }
        : null,
    }));

    // Get payments for the month
    const paymentsInMonth = await Payment.find({
      months: monthYear,
      isActive: true,
    })
      .populate("userId", "name pgId")
      .select("userId amount months paymentDate")
      .lean();

    const paidUserIds = new Set(
      paymentsInMonth.map((payment: any) => payment.userId._id.toString())
    );

    const usersWithoutPayments = allUsersWithRentAmount.filter(
      (user: any) => !paidUserIds.has(user._id.toString())
    );

    return NextResponse.json({
      success: true,
      data: {
        monthYear,
        totalUsers: allUsersWithRentAmount.length,
        usersWithPayments: paymentsInMonth.length,
        usersWithoutPayments: usersWithoutPayments.length,
        missingPaymentUsers: usersWithoutPayments,
        exportDate: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error exporting missing payments:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to export missing payments",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
