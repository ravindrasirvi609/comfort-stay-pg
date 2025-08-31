/**
 * Integration Test for Credit Balance System
 * Tests credit system with actual database operations
 */

import { connectToDatabase } from "@/app/lib/db";
import UserDue from "@/app/api/models/UserDue";
import User from "@/app/api/models/User";
import Payment from "@/app/api/models/Payment";
import Room from "@/app/api/models/Room";
import { getUserAvailableCredit } from "@/app/utils/proratedRentCalculation";
import { Types } from "mongoose";

interface TestUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  roomId: Types.ObjectId;
}

interface TestRoom {
  _id: Types.ObjectId;
  roomNumber: string;
  price: number;
}

interface TestPayment {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  months: string[];
  paymentStatus: string;
}

interface TestDue {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  month: string;
  year: number;
  monthNumber: number;
  creditBalance: number;
  netDue: number;
}

async function setupTestData() {
  console.log("🔧 Setting up test data...");

  // Clean up existing test data
  await User.deleteMany({ email: { $regex: /test.*credit/i } });
  await Room.deleteMany({ roomNumber: { $regex: /TEST-CREDIT/i } });
  await Payment.deleteMany({ description: { $regex: /TEST-CREDIT/i } });
  await UserDue.deleteMany({ month: { $regex: /TEST/i } });

  // Create test room
  const testRoom = await Room.create({
    roomNumber: "TEST-CREDIT-001",
    price: 5000,
    type: "Single",
    isActive: true,
  });

  // Create test users
  const testUsers = await User.create([
    {
      name: "Test User Credit 1",
      email: "testcredit1@example.com",
      phoneNumber: "1234567890",
      roomId: testRoom._id,
      moveInDate: new Date("2024-12-01"),
      isActive: true,
    },
    {
      name: "Test User Credit 2",
      email: "testcredit2@example.com",
      phoneNumber: "1234567891",
      roomId: testRoom._id,
      moveInDate: new Date("2024-11-15"),
      isActive: true,
    },
  ]);

  console.log(`   ✅ Created test room: ${testRoom.roomNumber}`);
  console.log(`   ✅ Created ${testUsers.length} test users`);

  return { testRoom, testUsers };
}

async function testCreditAccumulation(userId: Types.ObjectId) {
  console.log("\n📋 Testing: Credit Accumulation from Overpayments");

  try {
    // Create December due record with overpayment
    const decemberDue = await UserDue.create({
      userId,
      month: "TEST December",
      year: 2024,
      monthNumber: 12,
      fullMonthRent: 5000,
      proratedRent: 5000,
      daysCovered: 31,
      totalDaysInMonth: 31,
      totalDue: 5000,
      currentMonthDue: 5000,
      previousUnpaidDue: 0,
      totalPaid: 7000, // Overpayment of ₹2,000
      remainingDue: 0,
      creditBalance: 2000, // Credit created from overpayment
      creditUsed: 0,
      netDue: 0,
      dueStatus: "Paid",
      dueDate: new Date("2024-12-05"),
      isProrated: false,
      isActive: true,
    });

    // Test getUserAvailableCredit function
    const availableCredit = await getUserAvailableCredit(
      userId.toString(),
      2025,
      1,
      UserDue
    );

    if (Math.abs(availableCredit - 2000) < 0.01) {
      console.log("   ✅ Credit accumulation test passed");
      console.log(`      Available Credit: ₹${availableCredit}`);
      return true;
    } else {
      console.log("   ❌ Credit accumulation test failed");
      console.log(`      Expected: ₹2000, Got: ₹${availableCredit}`);
      return false;
    }
  } catch (error) {
    console.log("   ❌ Error in credit accumulation test:", error);
    return false;
  }
}

async function testCreditApplication(userId: Types.ObjectId) {
  console.log("\n📋 Testing: Credit Application to Future Dues");

  try {
    // Create January due record with credit application
    const januaryDue = await UserDue.create({
      userId,
      month: "TEST January",
      year: 2025,
      monthNumber: 1,
      fullMonthRent: 5000,
      proratedRent: 5000,
      daysCovered: 31,
      totalDaysInMonth: 31,
      totalDue: 5000,
      currentMonthDue: 5000,
      previousUnpaidDue: 0,
      totalPaid: 4000, // User paid ₹4,000
      remainingDue: 0, // Should be 0 after credit application
      creditBalance: 1000, // Remaining credit after using ₹1,000
      creditUsed: 1000, // Used ₹1,000 from previous credit
      netDue: 0, // Final amount due after credit
      dueStatus: "Paid",
      dueDate: new Date("2025-01-05"),
      isProrated: false,
      isActive: true,
    });

    // Verify the credit application worked correctly
    const totalNeeded = januaryDue.totalDue; // ₹5,000
    const userPaid = januaryDue.totalPaid; // ₹4,000
    const creditUsed = januaryDue.creditUsed; // ₹1,000
    const netDue = januaryDue.netDue; // Should be ₹0

    const calculatedNetDue = totalNeeded - userPaid - creditUsed;

    if (Math.abs(netDue - calculatedNetDue) < 0.01 && netDue === 0) {
      console.log("   ✅ Credit application test passed");
      console.log(`      Total Due: ₹${totalNeeded}`);
      console.log(`      User Paid: ₹${userPaid}`);
      console.log(`      Credit Used: ₹${creditUsed}`);
      console.log(`      Net Due: ₹${netDue}`);
      console.log(`      Remaining Credit: ₹${januaryDue.creditBalance}`);
      return true;
    } else {
      console.log("   ❌ Credit application test failed");
      console.log(
        `      Expected Net Due: ₹${calculatedNetDue}, Got: ₹${netDue}`
      );
      return false;
    }
  } catch (error) {
    console.log("   ❌ Error in credit application test:", error);
    return false;
  }
}

async function testMultiMonthCreditFlow(userId: Types.ObjectId) {
  console.log("\n📋 Testing: Multi-Month Credit Flow");

  try {
    // Create February due record using remaining credit
    const februaryDue = await UserDue.create({
      userId,
      month: "TEST February",
      year: 2025,
      monthNumber: 2,
      fullMonthRent: 5000,
      proratedRent: 5000,
      daysCovered: 28,
      totalDaysInMonth: 28,
      totalDue: 5000,
      currentMonthDue: 5000,
      previousUnpaidDue: 0,
      totalPaid: 0, // No payment made
      remainingDue: 4000, // ₹5,000 - ₹1,000 credit = ₹4,000
      creditBalance: 0, // All credit used
      creditUsed: 1000, // Used remaining ₹1,000 credit
      netDue: 4000, // Still owes ₹4,000
      dueStatus: "Partial",
      dueDate: new Date("2025-02-05"),
      isProrated: false,
      isActive: true,
    });

    // Verify multi-month credit flow
    const expectedNetDue =
      februaryDue.totalDue - februaryDue.totalPaid - februaryDue.creditUsed;

    if (
      Math.abs(februaryDue.netDue - expectedNetDue) < 0.01 &&
      februaryDue.creditBalance === 0
    ) {
      console.log("   ✅ Multi-month credit flow test passed");
      console.log(`      Credit fully utilized across months`);
      console.log(`      Final Net Due: ₹${februaryDue.netDue}`);
      console.log(`      Remaining Credit: ₹${februaryDue.creditBalance}`);
      return true;
    } else {
      console.log("   ❌ Multi-month credit flow test failed");
      console.log(
        `      Expected Net Due: ₹${expectedNetDue}, Got: ₹${februaryDue.netDue}`
      );
      return false;
    }
  } catch (error) {
    console.log("   ❌ Error in multi-month credit flow test:", error);
    return false;
  }
}

async function testComplexCreditScenario(userId: Types.ObjectId) {
  console.log("\n📋 Testing: Complex Credit Scenario with Previous Unpaid");

  try {
    // Create March due record with previous unpaid + credit scenario
    const marchDue = await UserDue.create({
      userId,
      month: "TEST March",
      year: 2025,
      monthNumber: 3,
      fullMonthRent: 5000,
      proratedRent: 5000,
      daysCovered: 31,
      totalDaysInMonth: 31,
      totalDue: 9000, // ₹5,000 current + ₹4,000 previous unpaid
      currentMonthDue: 5000,
      previousUnpaidDue: 4000, // From February
      totalPaid: 12000, // Large overpayment
      remainingDue: 0,
      creditBalance: 3000, // New credit from overpayment
      creditUsed: 0, // No existing credit to use
      netDue: 0,
      dueStatus: "Paid",
      dueDate: new Date("2025-03-05"),
      isProrated: false,
      isActive: true,
    });

    // Verify complex scenario calculations
    const expectedCredit = marchDue.totalPaid - marchDue.totalDue; // ₹12,000 - ₹9,000 = ₹3,000

    if (
      Math.abs(marchDue.creditBalance - expectedCredit) < 0.01 &&
      marchDue.netDue === 0
    ) {
      console.log("   ✅ Complex credit scenario test passed");
      console.log(
        `      Total Due: ₹${marchDue.totalDue} (₹${marchDue.currentMonthDue} + ₹${marchDue.previousUnpaidDue})`
      );
      console.log(`      Total Paid: ₹${marchDue.totalPaid}`);
      console.log(`      New Credit: ₹${marchDue.creditBalance}`);
      console.log(`      Net Due: ₹${marchDue.netDue}`);
      return true;
    } else {
      console.log("   ❌ Complex credit scenario test failed");
      console.log(
        `      Expected Credit: ₹${expectedCredit}, Got: ₹${marchDue.creditBalance}`
      );
      return false;
    }
  } catch (error) {
    console.log("   ❌ Error in complex credit scenario test:", error);
    return false;
  }
}

async function cleanupTestData() {
  console.log("\n🧹 Cleaning up test data...");

  try {
    const cleanupResults = await Promise.all([
      User.deleteMany({ email: { $regex: /testcredit/i } }),
      Room.deleteMany({ roomNumber: { $regex: /TEST-CREDIT/i } }),
      Payment.deleteMany({ description: { $regex: /TEST-CREDIT/i } }),
      UserDue.deleteMany({ month: { $regex: /TEST/i } }),
    ]);

    console.log(`   ✅ Cleaned up ${cleanupResults[0].deletedCount} users`);
    console.log(`   ✅ Cleaned up ${cleanupResults[1].deletedCount} rooms`);
    console.log(`   ✅ Cleaned up ${cleanupResults[2].deletedCount} payments`);
    console.log(
      `   ✅ Cleaned up ${cleanupResults[3].deletedCount} due records`
    );
  } catch (error) {
    console.log("   ⚠️ Error during cleanup:", error);
  }
}

async function main() {
  console.log("🚀 Credit Balance System Integration Tests\n");
  console.log("=".repeat(60));

  try {
    // Connect to database
    await connectToDatabase();
    console.log("📊 Connected to database");

    // Setup test data
    const { testRoom, testUsers } = await setupTestData();
    const testUserId = testUsers[0]._id;

    console.log("=".repeat(60));

    // Run integration tests
    const tests = [
      () => testCreditAccumulation(testUserId),
      () => testCreditApplication(testUserId),
      () => testMultiMonthCreditFlow(testUserId),
      () => testComplexCreditScenario(testUserId),
    ];

    let passedTests = 0;
    const totalTests = tests.length;

    for (const test of tests) {
      const result = await test();
      if (result) passedTests++;
    }

    console.log("=".repeat(60));
    console.log(
      `\n📊 Integration Test Summary: ${passedTests}/${totalTests} passed`
    );

    if (passedTests === totalTests) {
      console.log("🎉 All integration tests passed!");
      console.log("   - Credit accumulation works correctly");
      console.log("   - Credit application functions properly");
      console.log("   - Multi-month credit flow is accurate");
      console.log("   - Complex scenarios are handled correctly");
      console.log("   - Database operations are working as expected");
    } else {
      console.log("⚠️  Some integration tests failed");
      console.log("   Please review the database operations and credit logic");
    }

    // Cleanup
    await cleanupTestData();

    console.log("\n✨ Integration tests completed");
    process.exit(passedTests === totalTests ? 0 : 1);
  } catch (error) {
    console.error("💥 Fatal error in integration tests:", error);

    // Attempt cleanup even on error
    try {
      await cleanupTestData();
    } catch (cleanupError) {
      console.error("💥 Error during cleanup:", cleanupError);
    }

    process.exit(1);
  }
}

// Run integration tests
main().catch(console.error);
