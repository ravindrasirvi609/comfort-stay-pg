import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { isAuthenticated, isAdmin, hashPassword } from "@/app/lib/auth";
import { sendWelcomeEmail } from "@/app/lib/email";
import { User, Room } from "@/app/api/models";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Admin privileges required.",
        },
        { status: 403 }
      );
    }

    // Get request body
    const requestData = await request.json();
    const { allocatedRoomNo, checkInDate } = requestData;

    if (!allocatedRoomNo) {
      return NextResponse.json(
        { success: false, message: "Room number is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the pending registration by ID
    const pendingUser = await User.findById(params.id);

    if (!pendingUser) {
      return NextResponse.json(
        { success: false, message: "Pending registration not found" },
        { status: 404 }
      );
    }

    // Check if user is already approved
    if (pendingUser.registrationStatus !== "Pending") {
      return NextResponse.json(
        {
          success: false,
          message: `This registration has already been ${pendingUser.registrationStatus.toLowerCase()}`,
        },
        { status: 400 }
      );
    }

    // Find the room
    const room = await Room.findOne({ roomNumber: allocatedRoomNo });

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    // Check if room has vacancy
    if (room.currentOccupancy >= room.capacity) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected room is already at full capacity",
        },
        { status: 400 }
      );
    }

    // Generate PG ID from email
    const pgId = pendingUser.email.split("@")[0].toUpperCase();

    // Generate password based on mobile number
    const lastFourDigits = pendingUser.phone.slice(-4);
    const plainPassword = `Comfort@${lastFourDigits}`;

    // Hash the password
    const hashedPassword = await hashPassword(plainPassword);

    // Update the pending user to approved user
    pendingUser.registrationStatus = "Approved";
    pendingUser.password = hashedPassword;
    pendingUser.pgId = pgId;
    pendingUser.roomId = room._id;
    pendingUser.allocatedRoomNo = allocatedRoomNo;
    pendingUser.moveInDate = checkInDate || new Date();
    pendingUser.approvalDate = new Date();

    await pendingUser.save();

    // Update room occupancy
    room.currentOccupancy += 1;
    if (room.currentOccupancy >= room.capacity) {
      room.status = "occupied";
    }
    await room.save();

    // Send welcome email with credentials
    await sendWelcomeEmail(
      pendingUser.name,
      pendingUser.email,
      pgId,
      plainPassword
    );

    return NextResponse.json({
      success: true,
      message:
        "Registration confirmed successfully. Login credentials sent to email.",
      user: {
        _id: pendingUser._id,
        name: pendingUser.name,
        email: pendingUser.email,
        pgId: pendingUser.pgId,
        roomNumber: allocatedRoomNo,
      },
    });
  } catch (error) {
    console.error("Error confirming registration:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
