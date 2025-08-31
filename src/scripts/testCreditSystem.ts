/**
 * Test script for Credit Balance System
 * Tests various credit scenarios to ensure correct calculations
 */

import { connectToDatabase } from "@/app/lib/db";
import UserDue from "@/app/api/models/UserDue";
import User from "@/app/api/models/User";
import Payment from "@/app/api/models/Payment";
import {
  calculateTotalDueWithCredit,
  getUserAvailableCredit,
  formatCreditDisplay,
  calculateCreditSummary,
} from "@/app/utils/proratedRentCalculation";

// Test data interface
interface TestScenario {
  name: string;
  description: string;
  input: {
    currentMonthRent: number;
    previousUnpaidDue: number;
    totalPaid: number;
    availableCredit: number;
  };
  expected: {
    netDue: number;
    newCreditBalance: number;
    creditUsed: number;
    dueStatus: string;
  };
}

// Test scenarios
const testScenarios: TestScenario[] = [
  {
    name: "Basic Payment - No Credit",
    description: "User pays exact amount with no previous credit",
    input: {
      currentMonthRent: 5000,
      previousUnpaidDue: 0,
      totalPaid: 5000,
      availableCredit: 0,
    },
    expected: {
      netDue: 0,
      newCreditBalance: 0,
      creditUsed: 0,
      dueStatus: "Paid",
    },
  },
  {
    name: "Overpayment Creates Credit",
    description: "User overpays, creating credit for future months",
    input: {
      currentMonthRent: 5000,
      previousUnpaidDue: 0,
      totalPaid: 7000,
      availableCredit: 0,
    },
    expected: {
      netDue: 0,
      newCreditBalance: 2000,
      creditUsed: 0,
      dueStatus: "Paid",
    },
  },
  {
    name: "Credit Fully Covers Dues",
    description: "Available credit is enough to cover all dues",
    input: {
      currentMonthRent: 4000,
      previousUnpaidDue: 1000,
      totalPaid: 0,
      availableCredit: 6000,
    },
    expected: {
      netDue: 0,
      newCreditBalance: 1000,
      creditUsed: 5000,
      dueStatus: "Paid",
    },
  },
  {
    name: "Credit Partially Covers Dues",
    description: "Credit reduces dues but doesn't cover everything",
    input: {
      currentMonthRent: 5000,
      previousUnpaidDue: 2000,
      totalPaid: 3000,
      availableCredit: 1500,
    },
    expected: {
      netDue: 2500,
      newCreditBalance: 0,
      creditUsed: 1500,
      dueStatus: "Partial",
    },
  },
  {
    name: "Complex Overpayment with Existing Credit",
    description: "User has existing credit and makes overpayment",
    input: {
      currentMonthRent: 4000,
      previousUnpaidDue: 1000,
      totalPaid: 8000,
      availableCredit: 500,
    },
    expected: {
      netDue: 0,
      newCreditBalance: 3500, // 500 existing + 3000 from overpayment (8000 - 5000 total due)
      creditUsed: 0, // No credit used because payment already covers everything
      dueStatus: "Paid",
    },
  },
  {
    name: "Large Previous Unpaid with Credit",
    description: "Multiple months unpaid with some credit available",
    input: {
      currentMonthRent: 5000,
      previousUnpaidDue: 10000,
      totalPaid: 8000,
      availableCredit: 2000,
    },
    expected: {
      netDue: 5000,
      newCreditBalance: 0,
      creditUsed: 2000,
      dueStatus: "Partial",
    },
  },
  {
    name: "Zero Payment with Credit",
    description: "No payment made but credit available",
    input: {
      currentMonthRent: 3000,
      previousUnpaidDue: 1000,
      totalPaid: 0,
      availableCredit: 2500,
    },
    expected: {
      netDue: 1500,
      newCreditBalance: 0,
      creditUsed: 2500,
      dueStatus: "Partial",
    },
  },
];

// Utility test scenarios
const utilityTests = [
  {
    name: "Format Credit Display",
    tests: [
      { input: 0, expected: "No Credit" },
      { input: 1500.5, expected: "₹1500.50 Credit Available" },
      { input: 10000, expected: "₹10000.00 Credit Available" },
      { input: 0.01, expected: "₹0.01 Credit Available" },
    ],
  },
  {
    name: "Calculate Credit Summary",
    input: [
      { creditBalance: 1000, netDue: -500 },
      { creditBalance: 0, netDue: 2000 },
      { creditBalance: 2500, netDue: 0 },
      { creditBalance: 500, netDue: 1000 },
    ],
    expected: {
      totalUsers: 4,
      usersWithCredit: 3,
      totalCreditAmount: 4000,
      averageCreditPerUser: 1000,
    },
  },
];

async function runCreditCalculationTests() {
  console.log("🧪 Starting Credit System Calculation Tests...\n");

  let passedTests = 0;
  let totalTests = testScenarios.length;

  for (const scenario of testScenarios) {
    console.log(`📋 Testing: ${scenario.name}`);
    console.log(`   ${scenario.description}`);

    try {
      const result = calculateTotalDueWithCredit(
        scenario.input.currentMonthRent,
        scenario.input.previousUnpaidDue,
        scenario.input.totalPaid,
        scenario.input.availableCredit
      );

      // Check all expected values
      const checks = [
        {
          field: "netDue",
          actual: result.netDue,
          expected: scenario.expected.netDue,
        },
        {
          field: "newCreditBalance",
          actual: result.newCreditBalance,
          expected: scenario.expected.newCreditBalance,
        },
        {
          field: "creditUsed",
          actual: result.creditUsed,
          expected: scenario.expected.creditUsed,
        },
        {
          field: "dueStatus",
          actual: result.dueStatus,
          expected: scenario.expected.dueStatus,
        },
      ];

      let testPassed = true;
      let errors: string[] = [];

      for (const check of checks) {
        if (Math.abs(Number(check.actual) - Number(check.expected)) > 0.01) {
          testPassed = false;
          errors.push(
            `   ❌ ${check.field}: Expected ${check.expected}, got ${check.actual}`
          );
        }
      }

      if (testPassed) {
        console.log("   ✅ PASSED");
        passedTests++;
      } else {
        console.log("   ❌ FAILED");
        errors.forEach((error) => console.log(error));

        // Show detailed breakdown
        console.log("   📊 Actual result:");
        console.log(`      Net Due: ₹${result.netDue}`);
        console.log(`      Credit Balance: ₹${result.newCreditBalance}`);
        console.log(`      Credit Used: ₹${result.creditUsed}`);
        console.log(`      Status: ${result.dueStatus}`);
      }
    } catch (error) {
      console.log("   ❌ ERROR:", error);
    }

    console.log("");
  }

  console.log(
    `\n📊 Calculation Tests Summary: ${passedTests}/${totalTests} passed`
  );
  return passedTests === totalTests;
}

async function runUtilityTests() {
  console.log("🔧 Starting Utility Function Tests...\n");

  let passedTests = 0;
  let totalTests = 0;

  // Test formatCreditDisplay
  console.log("📋 Testing: Format Credit Display");
  const formatTests = utilityTests[0]?.tests;
  if (formatTests) {
    totalTests += formatTests.length;

    for (const test of formatTests) {
      const result = formatCreditDisplay(test.input);
      if (result === test.expected) {
        console.log(`   ✅ formatCreditDisplay(${test.input}) = "${result}"`);
        passedTests++;
      } else {
        console.log(
          `   ❌ formatCreditDisplay(${test.input}): Expected "${test.expected}", got "${result}"`
        );
      }
    }
  }

  // Test calculateCreditSummary
  console.log("\n📋 Testing: Calculate Credit Summary");
  totalTests++;
  try {
    const summaryTest = utilityTests[1];
    if (summaryTest?.input && summaryTest?.expected) {
      const result = calculateCreditSummary(summaryTest.input);

      const totalUsersMatch =
        result.totalUsers === summaryTest.expected.totalUsers;
      const usersWithCreditMatch =
        result.usersWithCredit === summaryTest.expected.usersWithCredit;
      const totalCreditAmountMatch =
        Math.abs(
          result.totalCreditAmount - summaryTest.expected.totalCreditAmount
        ) < 0.01;
      const averageCreditMatch =
        Math.abs(
          result.averageCreditPerUser -
            summaryTest.expected.averageCreditPerUser
        ) < 0.01;

      if (
        totalUsersMatch &&
        usersWithCreditMatch &&
        totalCreditAmountMatch &&
        averageCreditMatch
      ) {
        console.log("   ✅ calculateCreditSummary passed");
        console.log(`      Total Users: ${result.totalUsers}`);
        console.log(`      Users with Credit: ${result.usersWithCredit}`);
        console.log(`      Total Credit Amount: ₹${result.totalCreditAmount}`);
        console.log(
          `      Average Credit per User: ₹${result.averageCreditPerUser}`
        );
        passedTests++;
      } else {
        console.log("   ❌ calculateCreditSummary failed");
        console.log(
          `      Expected: Users=${summaryTest.expected.totalUsers}, WithCredit=${summaryTest.expected.usersWithCredit}, TotalAmount=₹${summaryTest.expected.totalCreditAmount}, AvgPerUser=₹${summaryTest.expected.averageCreditPerUser}`
        );
        console.log(
          `      Got: Users=${result.totalUsers}, WithCredit=${result.usersWithCredit}, TotalAmount=₹${result.totalCreditAmount}, AvgPerUser=₹${result.averageCreditPerUser}`
        );
      }
    } else {
      console.log("   ❌ Test configuration error");
    }
  } catch (error) {
    console.log("   ❌ ERROR:", error);
  }

  console.log(
    `\n📊 Utility Tests Summary: ${passedTests}/${totalTests} passed`
  );
  return passedTests === totalTests;
}

async function runEdgeCaseTests() {
  console.log("⚠️  Starting Edge Case Tests...\n");

  const edgeCases = [
    {
      name: "Negative Credit (Should be handled gracefully)",
      input: {
        currentMonthRent: 5000,
        previousUnpaidDue: 0,
        totalPaid: 5000,
        availableCredit: -100,
      },
      expectError: false, // System should handle gracefully by treating as 0 credit
    },
    {
      name: "Zero Rent",
      input: {
        currentMonthRent: 0,
        previousUnpaidDue: 0,
        totalPaid: 1000,
        availableCredit: 0,
      },
      expectError: false,
    },
    {
      name: "Very Large Numbers",
      input: {
        currentMonthRent: 999999.99,
        previousUnpaidDue: 500000,
        totalPaid: 2000000,
        availableCredit: 100000,
      },
      expectError: false,
    },
    {
      name: "Decimal Precision",
      input: {
        currentMonthRent: 4999.99,
        previousUnpaidDue: 1000.01,
        totalPaid: 6000.5,
        availableCredit: 0.5,
      },
      expectError: false,
    },
  ];

  let passedTests = 0;
  const totalTests = edgeCases.length;

  for (const edgeCase of edgeCases) {
    console.log(`📋 Testing: ${edgeCase.name}`);

    try {
      const result = calculateTotalDueWithCredit(
        edgeCase.input.currentMonthRent,
        edgeCase.input.previousUnpaidDue,
        edgeCase.input.totalPaid,
        edgeCase.input.availableCredit
      );

      // Basic validation - no NaN, no negative credit balance
      const isValid =
        !isNaN(result.netDue) &&
        !isNaN(result.newCreditBalance) &&
        !isNaN(result.creditUsed) &&
        result.newCreditBalance >= 0 &&
        result.creditUsed >= 0;

      if (isValid) {
        console.log("   ✅ PASSED - Valid calculations");
        console.log(`      Net Due: ₹${result.netDue}`);
        console.log(`      Credit Balance: ₹${result.newCreditBalance}`);
        passedTests++;
      } else {
        console.log("   ❌ FAILED - Invalid calculations");
        console.log(`      Net Due: ${result.netDue}`);
        console.log(`      Credit Balance: ${result.newCreditBalance}`);
        console.log(`      Credit Used: ${result.creditUsed}`);
      }
    } catch (error) {
      if (edgeCase.expectError) {
        console.log("   ✅ PASSED - Expected error occurred");
        passedTests++;
      } else {
        console.log("   ❌ ERROR (unexpected):", error);
      }
    }

    console.log("");
  }

  console.log(
    `📊 Edge Case Tests Summary: ${passedTests}/${totalTests} passed`
  );
  return passedTests === totalTests;
}

async function main() {
  console.log("🚀 Credit Balance System Test Suite\n");
  console.log("=".repeat(50));

  const calculationTestsPass = await runCreditCalculationTests();
  console.log("=".repeat(50));

  const utilityTestsPass = await runUtilityTests();
  console.log("=".repeat(50));

  const edgeCaseTestsPass = await runEdgeCaseTests();
  console.log("=".repeat(50));

  // Overall summary
  console.log("\n🎯 Overall Test Results:");
  console.log(
    `   Calculation Tests: ${calculationTestsPass ? "✅ PASSED" : "❌ FAILED"}`
  );
  console.log(
    `   Utility Tests: ${utilityTestsPass ? "✅ PASSED" : "❌ FAILED"}`
  );
  console.log(
    `   Edge Case Tests: ${edgeCaseTestsPass ? "✅ PASSED" : "❌ FAILED"}`
  );

  const allTestsPass =
    calculationTestsPass && utilityTestsPass && edgeCaseTestsPass;
  console.log(
    `\n🏆 Final Result: ${allTestsPass ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"}`
  );

  if (allTestsPass) {
    console.log("\n🎉 The Credit Balance System is working correctly!");
    console.log("   - All calculations are accurate");
    console.log("   - Utility functions work as expected");
    console.log("   - Edge cases are handled properly");
    console.log("   - System is ready for production use");
  } else {
    console.log("\n⚠️  Some tests failed. Please review the implementation.");
  }

  process.exit(allTestsPass ? 0 : 1);
}

// Run tests
main().catch(console.error);
