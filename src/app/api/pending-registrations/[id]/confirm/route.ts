import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import {
  isAuthenticated,
  isAdmin,
  generatePgId,
  generatePassword,
  hashPassword,
} from "@/app/lib/auth";
import { sendWelcomeEmail } from "@/app/lib/email";
import { User, PendingUser, Room } from "@/app/api/models";

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
    const pendingRegistration = await PendingUser.findById(params.id);

    if (!pendingRegistration) {
      return NextResponse.json(
        { success: false, message: "Pending registration not found" },
        { status: 404 }
      );
    }

    // Check if email already exists in User collection
    const existingUser = await User.findOne({
      email: pendingRegistration.emailAddress,
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "A user with this email already exists" },
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

    // Generate PG ID
    const pgId = generatePgId();

    // Generate a password (either use the one from the request or generate a new one)
    const plainPassword = generatePassword();

    // Hash the password
    const hashedPassword = await hashPassword(plainPassword);

    // Create new user with all fields from PendingUser
    const newUser = new User({
      name: pendingRegistration.fullName,
      email: pendingRegistration.emailAddress,
      phone: pendingRegistration.mobileNumber,
      role: "user",
      password: hashedPassword,
      pgId,

      // Copy additional fields from pendingRegistration
      fathersName: pendingRegistration.fathersName,
      permanentAddress: pendingRegistration.permanentAddress,
      city: pendingRegistration.city,
      state: pendingRegistration.state,
      guardianMobileNumber: pendingRegistration.guardianMobileNumber,
      validIdType: pendingRegistration.validIdType,
      companyNameAndAddress: pendingRegistration.companyNameAndAddress,

      // Document links
      validIdPhoto: pendingRegistration.validIdPhoto,
      passportPhoto: pendingRegistration.passportPhoto,

      // Room assignment
      roomId: room._id,

      // Move-in date
      moveInDate: checkInDate || new Date(),
      isActive: true,
    });

    await newUser.save();

    // Update room occupancy
    room.currentOccupancy += 1;
    if (room.currentOccupancy >= room.capacity) {
      room.status = "occupied";
    }
    await room.save();

    // Update pending registration status
    pendingRegistration.status = "Confirmed";
    pendingRegistration.allocatedRoomNo = allocatedRoomNo;
    pendingRegistration.checkInDate = checkInDate || new Date();
    await pendingRegistration.save();

    // Send welcome email with credentials
    await sendWelcomeEmail(
      pendingRegistration.fullName,
      pendingRegistration.emailAddress,
      pgId,
      plainPassword
    );

    return NextResponse.json({
      success: true,
      message:
        "Registration confirmed successfully. Login credentials sent to email.",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        pgId: newUser.pgId,
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
