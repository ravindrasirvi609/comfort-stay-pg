import { IUserDue } from "../api/models/UserDue";

/**
 * Utility functions for calculating prorated rent and managing due amounts
 */

export interface ProratedCalculation {
  fullMonthRent: number;
  proratedRent: number;
  daysCovered: number;
  totalDaysInMonth: number;
  isProrated: boolean;
  dailyRate: number;
  checkInDate: Date;
  targetMonth: number;
  targetYear: number;
}

export interface DueCalculation {
  currentMonthDue: number;
  previousUnpaidDue: number;
  totalDue: number;
  totalPaid: number;
  remainingDue: number;
  dueStatus: "Paid" | "Partial" | "Unpaid" | "Overdue";
}

/**
 * Calculate prorated rent based on check-in date
 */
export function calculateProratedRent(
  fullMonthRent: number,
  checkInDate: Date,
  targetMonth: number,
  targetYear: number
): ProratedCalculation {
  const checkInMonth = checkInDate.getMonth() + 1; // getMonth() returns 0-11
  const checkInYear = checkInDate.getFullYear();
  const checkInDay = checkInDate.getDate();

  const totalDaysInMonth = new Date(targetYear, targetMonth, 0).getDate();
  const dailyRate = fullMonthRent / totalDaysInMonth;

  // If check-in is not in the target month, return full rent
  if (checkInMonth !== targetMonth || checkInYear !== targetYear) {
    return {
      fullMonthRent,
      proratedRent: fullMonthRent,
      daysCovered: totalDaysInMonth,
      totalDaysInMonth,
      isProrated: false,
      dailyRate,
      checkInDate,
      targetMonth,
      targetYear,
    };
  }

  // Calculate prorated amount for partial month
  const daysCovered = totalDaysInMonth - checkInDay + 1; // +1 to include check-in day
  const proratedRent = Number((dailyRate * daysCovered).toFixed(2)); // Keep 2 decimal places, no rounding up

  return {
    fullMonthRent,
    proratedRent,
    daysCovered,
    totalDaysInMonth,
    isProrated: true,
    dailyRate,
    checkInDate,
    targetMonth,
    targetYear,
  };
}

/**
 * Calculate total dues including previous unpaid amounts
 */
export function calculateTotalDue(
  currentMonthDue: number,
  previousUnpaidDue: number,
  totalPaid: number
): DueCalculation {
  const totalDue = currentMonthDue + previousUnpaidDue;
  const remainingDue = Math.max(0, totalDue - totalPaid);

  let dueStatus: "Paid" | "Partial" | "Unpaid" | "Overdue";

  if (remainingDue === 0) {
    dueStatus = "Paid";
  } else if (totalPaid > 0) {
    dueStatus = "Partial";
  } else {
    dueStatus = "Unpaid";
  }

  return {
    currentMonthDue,
    previousUnpaidDue,
    totalDue,
    totalPaid,
    remainingDue,
    dueStatus,
  };
}

/**
 * Get month name and details
 */
export function getMonthDetails(date: Date): {
  month: string;
  year: number;
  monthNumber: number;
  totalDaysInMonth: number;
} {
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  const monthNumber = date.getMonth() + 1;
  const totalDaysInMonth = new Date(year, monthNumber, 0).getDate();

  return { month, year, monthNumber, totalDaysInMonth };
}

/**
 * Generate due date (typically 5th of the following month)
 */
export function generateDueDate(targetMonth: number, targetYear: number): Date {
  let dueMonth = targetMonth + 1;
  let dueYear = targetYear;

  if (dueMonth > 12) {
    dueMonth = 1;
    dueYear += 1;
  }

  return new Date(dueYear, dueMonth - 1, 5); // 5th of next month
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Check if due is overdue
 */
export function isDueOverdue(dueDate: Date): boolean {
  return new Date() > dueDate;
}

/**
 * Calculate days between two dates
 */
export function daysBetween(startDate: Date, endDate: Date): number {
  const timeDifference = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDifference / (1000 * 3600 * 24));
}

/**
 * Get all months between check-in date and current date
 */
export function getMonthsBetweenDates(
  startDate: Date,
  endDate: Date
): Array<{
  month: string;
  year: number;
  monthNumber: number;
}> {
  const months = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (current <= end) {
    months.push(getMonthDetails(current));
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

/**
 * Validate prorated calculation parameters
 */
export function validateProratedParams(
  fullMonthRent: number,
  checkInDate: Date,
  targetMonth: number,
  targetYear: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (fullMonthRent <= 0) {
    errors.push("Full month rent must be greater than 0");
  }

  if (!(checkInDate instanceof Date) || isNaN(checkInDate.getTime())) {
    errors.push("Invalid check-in date");
  }

  if (targetMonth < 1 || targetMonth > 12) {
    errors.push("Target month must be between 1 and 12");
  }

  if (targetYear < 2020 || targetYear > 2030) {
    errors.push("Target year must be between 2020 and 2030");
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Example usage and test function
 */
export function testProratedCalculation(): void {
  // Test case: User checks in on 16th January 2025
  // Room rent is ₹8000 per month
  // January has 31 days
  // User should pay for 16 days (16th to 31st)

  const checkInDate = new Date(2025, 0, 16); // January 16, 2025
  const fullMonthRent = 8000;
  const targetMonth = 1; // January
  const targetYear = 2025;

  const result = calculateProratedRent(
    fullMonthRent,
    checkInDate,
    targetMonth,
    targetYear
  );

  console.log("Prorated Rent Calculation Test:");
  console.log("Check-in Date:", checkInDate.toDateString());
  console.log("Full Month Rent: ₹", fullMonthRent);
  console.log("Total Days in Month:", result.totalDaysInMonth);
  console.log("Days Covered:", result.daysCovered);
  console.log("Daily Rate: ₹", result.dailyRate.toFixed(2));
  console.log("Prorated Rent: ₹", result.proratedRent);
  console.log("Is Prorated:", result.isProrated);

  // Expected: 16 days out of 31 days
  // Daily rate: 8000/31 = ₹258.06
  // Prorated: 258.06 * 16 = ₹4129 (rounded up)
}
