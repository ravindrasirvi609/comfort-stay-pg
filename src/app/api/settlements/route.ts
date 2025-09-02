import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import DueSettlement from "../models/DueSettlement";

// GET /api/settlements - List all settlements (admin only) with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || ""; // user name / pgId
    const month = url.searchParams.get("month") || ""; // e.g., "September"
    const year = url.searchParams.get("year") || ""; // e.g., "2025"
    const reason = url.searchParams.get("reason") || "";

    // Build base match
    const match: Record<string, any> = { isActive: true };
    if (month && year) {
      match.month = `${month} ${year}`;
    } else if (month) {
      match.month = { $regex: new RegExp(`^${month} `, "i") };
    } else if (year) {
      match.month = { $regex: new RegExp(` ${year}$`, "i") };
    }
    if (reason) {
      match.reason = reason;
    }

    const skip = (page - 1) * limit;

    // Aggregation with user and admin info + optional search
    const basePipeline: any[] = [
      { $match: match },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $lookup: {
          from: "users",
          localField: "settledBy",
          foreignField: "_id",
          as: "adminInfo",
        },
      },
      { $unwind: "$adminInfo" },
    ];

    const searchPipeline: any[] = search
      ? [
          {
            $match: {
              $or: [
                { "userInfo.name": { $regex: search, $options: "i" } },
                { "userInfo.pgId": { $regex: search, $options: "i" } },
              ],
            },
          },
        ]
      : [];

    // Count total
    const countPipeline = [
      ...basePipeline,
      ...searchPipeline,
      { $count: "total" },
    ];
    const countResult = await DueSettlement.aggregate(countPipeline);
    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    // Fetch page
    const dataPipeline = [
      ...basePipeline,
      ...searchPipeline,
      { $sort: { settledAt: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          month: 1,
          amount: 1,
          reason: 1,
          remarks: 1,
          settledAt: 1,
          user: {
            _id: "$userInfo._id",
            name: "$userInfo.name",
            email: "$userInfo.email",
            pgId: "$userInfo.pgId",
          },
          settledBy: {
            _id: "$adminInfo._id",
            name: "$adminInfo.name",
            email: "$adminInfo.email",
          },
        },
      },
    ];

    const settlements = await DueSettlement.aggregate(dataPipeline);

    return NextResponse.json({
      success: true,
      settlements,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit) || 1,
        totalCount,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching settlements:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch settlements" },
      { status: 500 }
    );
  }
}
