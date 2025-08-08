// Load environment variables first
import { config } from "dotenv";
import * as path from "path";
import * as url from "url";

// Get the directory of the current module
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project .env.local (two levels up from src/scripts)
config({ path: path.resolve(__dirname, "../../.env.local") });

import mongoose from "mongoose";

// --- Configuration (CLI/env overridable) ---
// Simple arg parser for flags like --floors=6
function getArg(name: string): string | undefined {
  const prefix = name + "=";
  const arg = process.argv.find((a) => a.startsWith(prefix));
  if (arg) return arg.slice(prefix.length);
  const idx = process.argv.indexOf(name);
  if (
    idx !== -1 &&
    process.argv[idx + 1] &&
    !process.argv[idx + 1].startsWith("--")
  ) {
    return process.argv[idx + 1];
  }
  return undefined;
}

const FLOORS = Number(getArg("--floors") || process.env.FLOORS || 6);
const ROOMS_PER_FLOOR = Number(
  getArg("--rooms") || process.env.ROOMS_PER_FLOOR || 12
);
const BUILDING: "A" | "B" = (
  getArg("--building") ||
  process.env.BUILDING ||
  "A"
).toUpperCase() as "A" | "B";

// Provide a simple pattern for 3-sharing positions per floor, e.g., "1,5,10"
const THREE_SHARING_POSITIONS: number[] = (() => {
  const raw = getArg("--three") || process.env.THREE_SHARING_POS;
  if (raw) {
    return raw
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n) && n >= 1 && n <= ROOMS_PER_FLOOR);
  }
  // Default pattern: rooms 1, 5, and 10 are 3-sharing when available
  return [1, 5, 10].filter((n) => n <= ROOMS_PER_FLOOR);
})();

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
    // Import after dotenv config to ensure env is loaded
    const { connectToDatabase } = await import("../app/lib/db");
    const { default: Room } = await import("../app/api/models/Room");
    await connectToDatabase();
    console.log("Connected to database successfully");

    // Clear existing rooms first
    console.log("Clearing existing rooms...");
    await Room.deleteMany({});
    console.log("Existing rooms cleared");

    type NewRoom = {
      building: "A" | "B";
      roomNumber: string;
      floor: number;
      type: "2-sharing" | "3-sharing";
      price: number;
      capacity: number;
      currentOccupancy: number;
      amenities: string[];
      status: "available" | "occupied" | "maintenance";
    };
    const roomsToCreate: NewRoom[] = [];

    // Create rooms for each floor
    for (let floor = 1; floor <= FLOORS; floor++) {
      for (let roomPos = 1; roomPos <= ROOMS_PER_FLOOR; roomPos++) {
        const roomNumber = `${floor}${roomPos.toString().padStart(2, "0")}`;
        const isThreeSharing = THREE_SHARING_POSITIONS.includes(roomPos);
        const type: "2-sharing" | "3-sharing" = isThreeSharing
          ? "3-sharing"
          : "2-sharing";
        const capacity = isThreeSharing ? 3 : 2;
        const price = PRICING[type];

        roomsToCreate.push({
          building: BUILDING,
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
