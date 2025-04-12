import mongoose from "mongoose";
import { connectToDatabase } from "../app/lib/db";
import Room from "../app/api/models/Room";

// Configuration
const FLOORS = 6;
const ROOMS_PER_FLOOR = 17;
const ROOM_TYPES: Record<number, "2-sharing" | "3-sharing"> = {
  // Room numbers for each floor that are 3-sharing
  // All other rooms will be 2-sharing
  101: "3-sharing",
  105: "3-sharing",
  110: "3-sharing",
  115: "3-sharing",
  201: "3-sharing",
  205: "3-sharing",
  210: "3-sharing",
  215: "3-sharing",
  301: "3-sharing",
  305: "3-sharing",
  310: "3-sharing",
  315: "3-sharing",
  401: "3-sharing",
  405: "3-sharing",
  410: "3-sharing",
  415: "3-sharing",
  501: "3-sharing",
  505: "3-sharing",
  510: "3-sharing",
  515: "3-sharing",
  601: "3-sharing",
  605: "3-sharing",
  610: "3-sharing",
  615: "3-sharing",
};

// Pricing based on room type
const PRICING: Record<"2-sharing" | "3-sharing", number> = {
  "2-sharing": 9500, // Price for 2-sharing rooms
  "3-sharing": 8000, // Price for 3-sharing rooms
};

// Amenities common for all rooms
const DEFAULT_AMENITIES = [
  "Wi-Fi",
  "Bed",
  "Study Table",
  "Chair",
  "Wardrobe",
  "Fan",
  "Electricity",
  "Water",
];

async function createRooms() {
  try {
    console.log("Connecting to database...");
    await connectToDatabase();
    console.log("Connected to database successfully");

    // Clear existing rooms first
    console.log("Clearing existing rooms...");
    await Room.deleteMany({});
    console.log("Existing rooms cleared");

    const roomsToCreate = [];

    // Create rooms for each floor
    for (let floor = 1; floor <= FLOORS; floor++) {
      for (let roomNum = 1; roomNum <= ROOMS_PER_FLOOR; roomNum++) {
        const roomNumber = `${floor}${roomNum.toString().padStart(2, "0")}`;
        const roomNumberInt = parseInt(roomNumber);
        const type = ROOM_TYPES[roomNumberInt] || "2-sharing";
        const capacity = type === "2-sharing" ? 2 : 3;
        const price = PRICING[type];

        roomsToCreate.push({
          roomNumber,
          floor,
          type,
          price,
          capacity,
          currentOccupancy: 0,
          amenities: DEFAULT_AMENITIES,
          status: "available",
        });
      }
    }

    console.log(`Creating ${roomsToCreate.length} rooms...`);
    const result = await Room.insertMany(roomsToCreate);
    console.log(`Successfully created ${result.length} rooms`);

    // List some rooms as verification
    console.log("\nSample of created rooms:");
    const sampleRooms = await Room.find().limit(5);
    console.log(sampleRooms);

    console.log("\nRoom count by type:");
    const twoSharingCount = await Room.countDocuments({ type: "2-sharing" });
    const threeSharingCount = await Room.countDocuments({ type: "3-sharing" });
    console.log(`2-sharing rooms: ${twoSharingCount}`);
    console.log(`3-sharing rooms: ${threeSharingCount}`);
    console.log(`Total rooms: ${twoSharingCount + threeSharingCount}`);
  } catch (error) {
    console.error("Error creating rooms:", error);
  } finally {
    // Close the database connection
    await mongoose.disconnect();
    console.log("Database connection closed");
    process.exit(0);
  }
}

// Run the function
createRooms();
