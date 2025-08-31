/**
 * Quick test to verify decimal calculation fix
 */

// Simulate the old rounding logic
function oldCalculation(fullRent, daysInMonth, daysCovered) {
  const dailyRate = fullRent / daysInMonth;
  return Math.ceil(dailyRate * daysCovered); // Old: rounded up
}

// Simulate the new decimal logic
function newCalculation(fullRent, daysInMonth, daysCovered) {
  const dailyRate = fullRent / daysInMonth;
  return Number((dailyRate * daysCovered).toFixed(2)); // New: 2 decimal places
}

// Test scenarios
const testCases = [
  { rent: 8000, totalDays: 31, daysCovered: 16 }, // January 16th check-in
  { rent: 10000, totalDays: 30, daysCovered: 10 }, // Mid-month check-in
  { rent: 7500, totalDays: 28, daysCovered: 7 }, // Week's stay
];

console.log("Rent Calculation Comparison:");
console.log("========================================");

testCases.forEach((test, index) => {
  const oldResult = oldCalculation(test.rent, test.totalDays, test.daysCovered);
  const newResult = newCalculation(test.rent, test.totalDays, test.daysCovered);
  const dailyRate = (test.rent / test.totalDays).toFixed(2);
  
  console.log(`\nTest ${index + 1}:`);
  console.log(`  Monthly Rent: ₹${test.rent}`);
  console.log(`  Days in Month: ${test.totalDays}`);
  console.log(`  Days Covered: ${test.daysCovered}`);
  console.log(`  Daily Rate: ₹${dailyRate}`);
  console.log(`  Old Result (rounded up): ₹${oldResult}`);
  console.log(`  New Result (2 decimals): ₹${newResult}`);
  console.log(`  Difference: ₹${(oldResult - newResult).toFixed(2)}`);
});
