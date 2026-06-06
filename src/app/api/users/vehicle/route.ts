import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/db";
import User from "@/app/api/models/User";

const normalizeVehicleNumber = (value: string) =>
  value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

export async function PUT(request: NextRequest) {
  try {
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (user.role !== "user") {
      return NextResponse.json(
        { success: false, message: "Only residents can update vehicle number" },
        { status: 403 }
      );
    }

    const { vehicleNumber } = await request.json();
    const normalizedVehicleNumber = normalizeVehicleNumber(
      String(vehicleNumber || "")
    );

    if (!normalizedVehicleNumber) {
      return NextResponse.json(
        { success: false, message: "Vehicle number is required" },
        { status: 400 }
      );
    }

    if (
      normalizedVehicleNumber.length < 6 ||
      normalizedVehicleNumber.length > 15
    ) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid vehicle number" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingVehicleOwner = await User.findOne({
      _id: { $ne: user._id },
      isDeleted: { $ne: true },
      isActive: true,
      vehicleNumber: normalizedVehicleNumber,
    }).select("_id name");

    if (existingVehicleOwner) {
      return NextResponse.json(
        {
          success: false,
          message: "This vehicle number is already registered with another resident",
        },
        { status: 409 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        vehicleNumber: normalizedVehicleNumber,
        updatedAt: new Date(),
      },
      { new: true }
    ).select("vehicleNumber");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Vehicle number updated successfully",
      vehicleNumber: updatedUser.vehicleNumber,
    });
  } catch (error) {
    console.error("Vehicle number update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
