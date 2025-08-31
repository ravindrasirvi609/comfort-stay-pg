import React from "react";
import { formatCurrency } from "@/app/utils/proratedRentCalculation";

interface DueDisplayProps {
  user: {
    _id: string;
    name: string;
    currentMonthRentStatus?: "Paid" | "Unpaid" | "N/A";
    dueAmount?: number;
    totalDue?: number;
    currentMonthDue?: number;
    previousUnpaidDue?: number;
    isProrated?: boolean;
    daysCovered?: number;
    totalDaysInMonth?: number;
    checkInDate?: string;
    moveInDate?: string;
  };
  showDetails?: boolean;
}

export const DueDisplay: React.FC<DueDisplayProps> = ({
  user,
  showDetails = false,
}) => {
  const {
    currentMonthRentStatus = "N/A",
    dueAmount = 0,
    totalDue = 0,
    currentMonthDue = 0,
    previousUnpaidDue = 0,
    isProrated = false,
    daysCovered,
    totalDaysInMonth,
    checkInDate,
    moveInDate,
  } = user;

  // Use either new totalDue or fallback to old dueAmount
  const displayTotalDue = totalDue || dueAmount;
  const displayCurrentDue = currentMonthDue || dueAmount;

  if (currentMonthRentStatus === "N/A" || displayTotalDue === 0) {
    return (
      <div className="text-center">
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
          N/A
        </span>
      </div>
    );
  }

  if (currentMonthRentStatus === "Paid") {
    return (
      <div className="text-center">
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          Paid
        </span>
        {showDetails && isProrated && daysCovered && totalDaysInMonth && (
          <div className="text-xs text-gray-500 mt-1">
            Prorated: {daysCovered}/{totalDaysInMonth} days
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="space-y-1">
        {/* Total Due Amount */}
        <div>
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            {formatCurrency(displayTotalDue)}
          </span>
        </div>

        {/* Breakdown for details view */}
        {showDetails &&
          (displayCurrentDue !== displayTotalDue || isProrated) && (
            <div className="text-xs text-gray-600 space-y-0.5">
              {/* Current Month Due */}
              {displayCurrentDue > 0 && (
                <div className="flex justify-between items-center">
                  <span>Current Month:</span>
                  <span className="font-medium">
                    {formatCurrency(displayCurrentDue)}
                  </span>
                </div>
              )}

              {/* Previous Unpaid */}
              {previousUnpaidDue > 0 && (
                <div className="flex justify-between items-center">
                  <span>Previous Due:</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(previousUnpaidDue)}
                  </span>
                </div>
              )}

              {/* Prorated Information */}
              {isProrated && daysCovered && totalDaysInMonth && (
                <div className="text-center pt-1 border-t border-gray-200">
                  <span className="text-blue-600">
                    Prorated: {daysCovered}/{totalDaysInMonth} days
                  </span>
                  {(checkInDate || moveInDate) && (
                    <div className="text-xs text-gray-500">
                      Checked in:{" "}
                      {new Date(
                        checkInDate || moveInDate!
                      ).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        {/* Simple breakdown for non-detailed view */}
        {!showDetails && previousUnpaidDue > 0 && (
          <div className="text-xs text-gray-500">
            (₹{displayCurrentDue.toLocaleString()} + ₹
            {previousUnpaidDue.toLocaleString()} prev.)
          </div>
        )}
      </div>
    </div>
  );
};

interface DuesSummaryProps {
  users: Array<{
    _id: string;
    name: string;
    currentMonthRentStatus?: "Paid" | "Unpaid" | "N/A";
    dueAmount?: number;
    totalDue?: number;
    currentMonthDue?: number;
    previousUnpaidDue?: number;
  }>;
}

export const DuesSummary: React.FC<DuesSummaryProps> = ({ users }) => {
  const summary = users.reduce(
    (acc, user) => {
      const totalDue = user.totalDue || user.dueAmount || 0;
      const currentDue = user.currentMonthDue || user.dueAmount || 0;
      const previousDue = user.previousUnpaidDue || 0;

      if (user.currentMonthRentStatus === "Paid") {
        acc.paidCount++;
      } else if (user.currentMonthRentStatus === "Unpaid" && totalDue > 0) {
        acc.unpaidCount++;
        acc.totalUnpaidAmount += totalDue;
        acc.currentMonthDue += currentDue;
        acc.previousUnpaidDue += previousDue;
      }

      return acc;
    },
    {
      paidCount: 0,
      unpaidCount: 0,
      totalUnpaidAmount: 0,
      currentMonthDue: 0,
      previousUnpaidDue: 0,
    }
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Payment Summary
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {summary.paidCount}
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">
            Paid Users
          </div>
        </div>

        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {summary.unpaidCount}
          </div>
          <div className="text-sm text-red-700 dark:text-red-300">
            Unpaid Users
          </div>
        </div>

        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(summary.currentMonthDue)}
          </div>
          <div className="text-sm text-orange-700 dark:text-orange-300">
            Current Month Due
          </div>
        </div>

        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(summary.totalUnpaidAmount)}
          </div>
          <div className="text-sm text-purple-700 dark:text-purple-300">
            Total Outstanding
          </div>
        </div>
      </div>

      {summary.previousUnpaidDue > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-yellow-700 dark:text-yellow-300">
              Previous Months Unpaid:
            </span>
            <span className="font-medium text-yellow-800 dark:text-yellow-200">
              {formatCurrency(summary.previousUnpaidDue)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DueDisplay;
