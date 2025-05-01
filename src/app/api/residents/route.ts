import { connectToDatabase } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { User } from "../models";

export async function GET() {
  try {
    await connectToDatabase();
    const residents = await User.find({})
      .populate("roomId", "roomNumber")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      residents,
    });
  } catch (error) {
    console.error("Error fetching residents:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch residents" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const resident = await User.create(body);

    return NextResponse.json(
      {
        success: true,
        resident,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating resident:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create resident" },
      { status: 500 }
    );
  }
}
