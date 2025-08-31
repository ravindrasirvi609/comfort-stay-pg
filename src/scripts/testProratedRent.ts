/**
 * Test script to demonstrate prorated rent calculation
 * Run this with: npx ts-node src/scripts/testProratedRent.ts
 */

import {
  testProratedCalculation,
  calculateProratedRent,
  formatCurrency,
} from "../app/utils/proratedRentCalculation.js";

console.log("=== Prorated Rent Calculation Tests ===\n");

// Test case 1: User checks in mid-month
console.log("Test Case 1: User checks in on 16th January 2025");
console.log("Room rent: ₹8,000 per month, January has 31 days");
const checkInDate1 = new Date(2025, 0, 16); // January 16, 2025
const result1 = calculateProratedRent(8000, checkInDate1, 1, 2025);

console.log(`Check-in Date: ${checkInDate1.toDateString()}`);
console.log(`Full Month Rent: ${formatCurrency(result1.fullMonthRent)}`);
console.log(
  `Days Covered: ${result1.daysCovered} out of ${result1.totalDaysInMonth}`
);
console.log(`Daily Rate: ${formatCurrency(result1.dailyRate)}`);
console.log(`Prorated Rent: ${formatCurrency(result1.proratedRent)}`);
console.log(`Is Prorated: ${result1.isProrated}`);
console.log("---\n");

// Test case 2: User checks in at beginning of month
console.log("Test Case 2: User checks in on 1st February 2025");
console.log("Room rent: ₹8,000 per month, February has 28 days");
const checkInDate2 = new Date(2025, 1, 1); // February 1, 2025
const result2 = calculateProratedRent(8000, checkInDate2, 2, 2025);

console.log(`Check-in Date: ${checkInDate2.toDateString()}`);
console.log(`Full Month Rent: ${formatCurrency(result2.fullMonthRent)}`);
console.log(
  `Days Covered: ${result2.daysCovered} out of ${result2.totalDaysInMonth}`
);
console.log(`Prorated Rent: ${formatCurrency(result2.proratedRent)}`);
console.log(`Is Prorated: ${result2.isProrated}`);
console.log("---\n");

// Test case 3: User checks in very late in month
console.log("Test Case 3: User checks in on 28th March 2025");
console.log("Room rent: ₹6,500 per month, March has 31 days");
const checkInDate3 = new Date(2025, 2, 28); // March 28, 2025
const result3 = calculateProratedRent(6500, checkInDate3, 3, 2025);

console.log(`Check-in Date: ${checkInDate3.toDateString()}`);
console.log(`Full Month Rent: ${formatCurrency(result3.fullMonthRent)}`);
console.log(
  `Days Covered: ${result3.daysCovered} out of ${result3.totalDaysInMonth}`
);
console.log(`Daily Rate: ${formatCurrency(result3.dailyRate)}`);
console.log(`Prorated Rent: ${formatCurrency(result3.proratedRent)}`);
console.log(`Is Prorated: ${result3.isProrated}`);
console.log("---\n");

// Test case 4: User checked in previous month (should get full rent)
console.log("Test Case 4: User checked in December, calculating for January");
console.log("Room rent: ₹9,000 per month");
const checkInDate4 = new Date(2024, 11, 15); // December 15, 2024
const result4 = calculateProratedRent(9000, checkInDate4, 1, 2025); // Calculating for January 2025

console.log(`Check-in Date: ${checkInDate4.toDateString()}`);
console.log(`Calculating for: January 2025`);
console.log(`Full Month Rent: ${formatCurrency(result4.fullMonthRent)}`);
console.log(
  `Days Covered: ${result4.daysCovered} out of ${result4.totalDaysInMonth}`
);
console.log(`Prorated Rent: ${formatCurrency(result4.proratedRent)}`);
console.log(`Is Prorated: ${result4.isProrated}`);
console.log("---\n");

// Test case 5: Different room prices
console.log("Test Case 5: Various room prices and check-in dates");
const testCases = [
  {
    rent: 5000,
    checkIn: new Date(2025, 0, 10),
    month: 1,
    year: 2025,
    description: "Budget room, 10th Jan",
  },
  {
    rent: 12000,
    checkIn: new Date(2025, 1, 20),
    month: 2,
    year: 2025,
    description: "Premium room, 20th Feb",
  },
  {
    rent: 7500,
    checkIn: new Date(2025, 2, 5),
    month: 3,
    year: 2025,
    description: "Standard room, 5th Mar",
  },
];

testCases.forEach((testCase, index) => {
  const result = calculateProratedRent(
    testCase.rent,
    testCase.checkIn,
    testCase.month,
    testCase.year
  );
  console.log(`${testCase.description}:`);
  console.log(
    `  Full Rent: ${formatCurrency(result.fullMonthRent)} | Prorated: ${formatCurrency(result.proratedRent)} | Days: ${result.daysCovered}/${result.totalDaysInMonth}`
  );
});

console.log("\n=== Summary ===");
console.log("Key Features:");
console.log("✓ Prorated calculation based on check-in date");
console.log("✓ Handles different months with varying days");
console.log("✓ Rounds up to nearest rupee for user-friendly amounts");
console.log("✓ Distinguishes between prorated and full month rent");
console.log("✓ Works with any room price and date combination");

// Run the built-in test function
console.log("\n=== Built-in Test Function ===");
testProratedCalculation();
