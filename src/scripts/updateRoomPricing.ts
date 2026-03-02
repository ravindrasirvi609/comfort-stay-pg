import { config } from "dotenv";
import mongoose from "mongoose";
import * as path from "path";
import * as url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env values from project root before importing db helper
config({ path: path.resolve(__dirname, "../../.env.local") });

const TARGET_PRICING: Record<"2-sharing" | "3-sharing", number> = {
  "2-sharing": 10000,
  "3-sharing": 8500,
};

async function updateRoomPricing() {
  try {
    const { connectToDatabase } = await import("../app/lib/db");
    const { default: Room } = await import("../app/api/models/Room");

    await connectToDatabase();

    const twoSharingResult = await Room.updateMany(
      { type: "2-sharing" },
      { $set: { price: TARGET_PRICING["2-sharing"] } }
    );

    const threeSharingResult = await Room.updateMany(
      { type: "3-sharing" },
      { $set: { price: TARGET_PRICING["3-sharing"] } }
    );

    console.log("Room pricing update completed.");
    console.log(
      `2-sharing -> ₹${TARGET_PRICING["2-sharing"]}: ${twoSharingResult.modifiedCount} updated (matched ${twoSharingResult.matchedCount})`
    );
    console.log(
      `3-sharing -> ₹${TARGET_PRICING["3-sharing"]}: ${threeSharingResult.modifiedCount} updated (matched ${threeSharingResult.matchedCount})`
    );
  } catch (error) {
    console.error("Failed to update room pricing:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

updateRoomPricing();
