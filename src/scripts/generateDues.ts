/**
 * Migration script to generate prorated dues for existing users
 * This script will:
 * 1. Find all active users with rooms
 * 2. Generate due records for the current month
 * 3. Calculate prorated rent based on their check-in dates
 * 4. Handle any existing payment data
 */

import { connectToDatabase } from "../app/lib/db";
import User from "../app/api/models/User";
import UserDue from "../app/api/models/UserDue";
import Payment from "../app/api/models/Payment";
import {
  calculateProratedRent,
  calculateTotalDue,
  getMonthDetails,
  generateDueDate,
} from "../app/utils/proratedRentCalculation";

interface MigrationResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
  details: Array<{
    userId: string;
    userName: string;
    status: "success" | "failed" | "skipped";
    message: string;
    proratedRent?: number;
    isProrated?: boolean;
  }>;
}

async function generateDuesForExistingUsers(
  targetMonth?: number,
  targetYear?: number,
  forceRecalculate: boolean = false
): Promise<MigrationResult> {
  await connectToDatabase();

  const currentDate = new Date();
  const month = targetMonth || currentDate.getMonth() + 1;
  const year = targetYear || currentDate.getFullYear();

  console.log(`\n=== Generating Dues for ${getMonthName(month)} ${year} ===`);

  const result: MigrationResult = {
    total: 0,
    success: 0,
    failed: 0,
    errors: [],
    details: [],
  };

  try {
    // Get all active users with rooms
    const users = await User.find({
      isActive: true,
      roomId: { $exists: true, $ne: null },
    }).populate("roomId", "roomNumber type price");

    console.log(`Found ${users.length} active users with rooms`);
    result.total = users.length;

    for (const user of users) {
      try {
        const userId = user._id.toString();
        const room = user.roomId as any;

        if (!room || !room.price) {
          result.details.push({
            userId,
            userName: user.name,
            status: "failed",
            message: "No room or room price found",
          });
          result.failed++;
          continue;
        }

        const fullMonthRent = room.price;
        const checkInDate = user.moveInDate || user.createdAt || new Date();

        // Check if due already exists
        const existingDue = await UserDue.findOne({
          userId,
          year,
          monthNumber: month,
          isActive: true,
        });

        if (existingDue && !forceRecalculate) {
          result.details.push({
            userId,
            userName: user.name,
            status: "skipped",
            message: "Due record already exists",
            proratedRent: existingDue.proratedRent,
            isProrated: existingDue.isProrated,
          });
          result.success++;
          continue;
        }

        // Calculate prorated rent
        const proratedCalc = calculateProratedRent(
          fullMonthRent,
          new Date(checkInDate),
          month,
          year
        );

        // Get previous month's unpaid dues
        let previousUnpaidDue = 0;
        const previousMonthDues = await UserDue.find({
          userId,
          $or: [
            { year: { $lt: year } },
            { year: year, monthNumber: { $lt: month } },
          ],
          remainingDue: { $gt: 0 },
          isActive: true,
        });

        previousUnpaidDue = previousMonthDues.reduce(
          (sum, due) => sum + due.remainingDue,
          0
        );

        // Get payments for this month
        const monthName = getMonthName(month);
        const monthYear = `${monthName} ${year}`;
        const payments = await Payment.find({
          userId,
          months: monthYear,
          paymentStatus: "Paid",
          isDepositPayment: false,
          isActive: true,
        });

        const totalPaid = payments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );

        // Calculate total due
        const dueCalc = calculateTotalDue(
          proratedCalc.proratedRent,
          previousUnpaidDue,
          totalPaid
        );

        const dueDate = generateDueDate(month, year);

        // Create due record data
        const dueData = {
          userId,
          month: monthName,
          year,
          monthNumber: month,
          fullMonthRent,
          proratedRent: proratedCalc.proratedRent,
          daysCovered: proratedCalc.daysCovered,
          totalDaysInMonth: proratedCalc.totalDaysInMonth,
          totalDue: dueCalc.totalDue,
          currentMonthDue: dueCalc.currentMonthDue,
          previousUnpaidDue: dueCalc.previousUnpaidDue,
          totalPaid: dueCalc.totalPaid,
          remainingDue: dueCalc.remainingDue,
          dueStatus: dueCalc.dueStatus,
          dueDate,
          checkInDate: proratedCalc.isProrated ? checkInDate : undefined,
          isProrated: proratedCalc.isProrated,
          isActive: true,
        };

        // Create or update due record
        let due;
        if (existingDue) {
          due = await UserDue.findByIdAndUpdate(existingDue._id, dueData, {
            new: true,
          });
        } else {
          due = new UserDue(dueData);
          await due.save();
        }

        result.details.push({
          userId,
          userName: user.name,
          status: "success",
          message: `${existingDue ? "Updated" : "Created"} due record`,
          proratedRent: proratedCalc.proratedRent,
          isProrated: proratedCalc.isProrated,
        });

        result.success++;

        console.log(
          `✓ ${user.name} - ${proratedCalc.isProrated ? "Prorated" : "Full"}: ₹${proratedCalc.proratedRent}`
        );
      } catch (error) {
        const errorMsg = `Error processing user ${user.name}: ${error}`;
        result.errors.push(errorMsg);
        result.details.push({
          userId: user._id.toString(),
          userName: user.name,
          status: "failed",
          message: errorMsg,
        });
        result.failed++;
        console.error(`✗ ${errorMsg}`);
      }
    }
  } catch (error) {
    const errorMsg = `Fatal error during migration: ${error}`;
    result.errors.push(errorMsg);
    console.error(errorMsg);
  }

  return result;
}

function getMonthName(monthNumber: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[monthNumber - 1];
}

// Main execution function
async function main() {
  console.log("=== Prorated Rent Due Generation Script ===");
  console.log("This script will generate prorated dues for existing users");

  const args = process.argv.slice(2);
  const targetMonth = args[0] ? parseInt(args[0]) : undefined;
  const targetYear = args[1] ? parseInt(args[1]) : undefined;
  const forceRecalculate = args.includes("--force");

  if (targetMonth && (targetMonth < 1 || targetMonth > 12)) {
    console.error("Invalid month. Please provide a month between 1 and 12.");
    process.exit(1);
  }

  if (targetYear && (targetYear < 2020 || targetYear > 2030)) {
    console.error("Invalid year. Please provide a year between 2020 and 2030.");
    process.exit(1);
  }

  try {
    const result = await generateDuesForExistingUsers(
      targetMonth,
      targetYear,
      forceRecalculate
    );

    console.log("\n=== Migration Results ===");
    console.log(`Total users processed: ${result.total}`);
    console.log(`Successful: ${result.success}`);
    console.log(`Failed: ${result.failed}`);
    console.log(`Errors: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log("\nErrors encountered:");
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    // Summary by status
    const prorated = result.details.filter((d) => d.isProrated).length;
    const fullMonth = result.details.filter(
      (d) => d.status === "success" && !d.isProrated
    ).length;

    console.log(`\nProration Summary:`);
    console.log(`- Prorated dues: ${prorated} users`);
    console.log(`- Full month dues: ${fullMonth} users`);

    console.log("\n=== Script completed ===");
    process.exit(result.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("Script execution failed:", error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

export { generateDuesForExistingUsers };
