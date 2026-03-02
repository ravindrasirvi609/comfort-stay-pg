import { config } from "dotenv";
import mongoose from "mongoose";
import * as path from "path";
import * as url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env values from project root before importing db helper
config({ path: path.resolve(__dirname, "../../.env.local") });

const TARGET_BY_OCCUPANCY = {
  2: { type: "2-sharing" as const, price: 10000 },
  3: { type: "3-sharing" as const, price: 8500 },
};

async function updateRoomPricing() {
  try {
    const { connectToDatabase } = await import("../app/lib/db");
    const { default: Room } = await import("../app/api/models/Room");

    await connectToDatabase();

    // Primary rule: room capacity determines sharing type and rent.
    const twoByCapacityResult = await Room.updateMany(
      { capacity: 2 },
      {
        $set: {
          type: TARGET_BY_OCCUPANCY[2].type,
          price: TARGET_BY_OCCUPANCY[2].price,
        },
      }
    );

    const threeByCapacityResult = await Room.updateMany(
      { capacity: 3 },
      {
        $set: {
          type: TARGET_BY_OCCUPANCY[3].type,
          price: TARGET_BY_OCCUPANCY[3].price,
        },
      }
    );

    // Fallback for legacy/invalid docs: infer from current occupancy only when
    // capacity is missing or not 2/3 to avoid changing valid partially occupied rooms.
    const twoFallbackResult = await Room.updateMany(
      { capacity: { $nin: [2, 3] }, currentOccupancy: 2 },
      {
        $set: {
          capacity: 2,
          type: TARGET_BY_OCCUPANCY[2].type,
          price: TARGET_BY_OCCUPANCY[2].price,
        },
      }
    );

    const threeFallbackResult = await Room.updateMany(
      { capacity: { $nin: [2, 3] }, currentOccupancy: 3 },
      {
        $set: {
          capacity: 3,
          type: TARGET_BY_OCCUPANCY[3].type,
          price: TARGET_BY_OCCUPANCY[3].price,
        },
      }
    );

    const unknownCapacityCount = await Room.countDocuments({
      capacity: { $nin: [2, 3] },
    });

    console.log("Room pricing/type update completed.");
    console.log(
      `Capacity 2 -> ${TARGET_BY_OCCUPANCY[2].type}, ₹${TARGET_BY_OCCUPANCY[2].price}: ${twoByCapacityResult.modifiedCount} updated (matched ${twoByCapacityResult.matchedCount})`
    );
    console.log(
      `Capacity 3 -> ${TARGET_BY_OCCUPANCY[3].type}, ₹${TARGET_BY_OCCUPANCY[3].price}: ${threeByCapacityResult.modifiedCount} updated (matched ${threeByCapacityResult.matchedCount})`
    );
    console.log(
      `Fallback (currentOccupancy=2): ${twoFallbackResult.modifiedCount} updated (matched ${twoFallbackResult.matchedCount})`
    );
    console.log(
      `Fallback (currentOccupancy=3): ${threeFallbackResult.modifiedCount} updated (matched ${threeFallbackResult.matchedCount})`
    );
    console.log(`Rooms with unknown capacity after update: ${unknownCapacityCount}`);
  } catch (error) {
    console.error("Failed to update room pricing:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

updateRoomPricing();
