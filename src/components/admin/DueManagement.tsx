import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { formatCurrency } from "@/app/utils/proratedRentCalculation";

interface DueManagementProps {
  onDuesUpdated?: () => void;
}

interface DueStats {
  totalDues: number;
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
  paidCount: number;
  unpaidCount: number;
  partialCount: number;
  overdueCount: number;
}

export const DueManagement: React.FC<DueManagementProps> = ({
  onDuesUpdated,
}) => {
  const [stats, setStats] = useState<DueStats | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Generate current month options
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    setSelectedMonth(currentMonth.toString());
    setSelectedYear(currentYear.toString());
    fetchStats();
  }, [currentMonth, currentYear]);

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/user-dues/recalculate");
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching due stats:", error);
    }
  };

  const generateDuesForMonth = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Please select month and year");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await axios.put("/api/user-dues", {
        targetMonth: parseInt(selectedMonth),
        targetYear: parseInt(selectedYear),
        forceRecalculate: true,
      });

      const { results } = response.data;
      toast.success(
        `Dues generated successfully! ${results.success} users processed, ${results.failed} failed.`
      );

      if (results.errors.length > 0) {
        console.error("Generation errors:", results.errors);
      }

      await fetchStats();
      onDuesUpdated?.();
    } catch (error: any) {
      console.error("Error generating dues:", error);
      toast.error(error.response?.data?.message || "Failed to generate dues");
    } finally {
      setIsGenerating(false);
    }
  };

  const recalculateAllDues = async () => {
    setIsRecalculating(true);
    try {
      // This would be a bulk recalculation endpoint
      const response = await axios.post("/api/user-dues/recalculate", {
        recalculateAll: true,
      });

      toast.success("All dues recalculated successfully!");
      await fetchStats();
      onDuesUpdated?.();
    } catch (error: any) {
      console.error("Error recalculating dues:", error);
      toast.error(
        error.response?.data?.message || "Failed to recalculate dues"
      );
    } finally {
      setIsRecalculating(false);
    }
  };

  const monthOptions = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const yearOptions = [];
  for (let year = currentYear - 1; year <= currentYear + 1; year++) {
    yearOptions.push({ value: year.toString(), label: year.toString() });
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Due Management
      </h3>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalDues}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Total Records
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.paidCount}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              Paid
            </div>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.unpaidCount}
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">Unpaid</div>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.overdueCount}
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">
              Overdue
            </div>
          </div>

          <div className="md:col-span-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(stats.totalAmount)}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">
              Total Due Amount
            </div>
          </div>

          <div className="md:col-span-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {formatCurrency(stats.totalRemaining)}
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              Outstanding Amount
            </div>
          </div>
        </div>
      )}

      {/* Due Generation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
          Generate Monthly Dues
        </h4>

        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
            >
              {yearOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={generateDuesForMonth}
            disabled={isGenerating}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </div>
            ) : (
              "Generate Dues"
            )}
          </button>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This will generate prorated dues for all active users for the selected
          month. Users who checked in mid-month will have their rent calculated
          proportionally.
        </div>

        {/* Recalculate All Dues */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={recalculateAllDues}
            disabled={isRecalculating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRecalculating ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Recalculating...
              </div>
            ) : (
              "Recalculate All Dues"
            )}
          </button>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            This will recalculate all existing due records based on current
            payment data.
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          About Prorated Rent Calculation
        </h5>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>
            • Users who check in mid-month pay proportional rent for remaining
            days
          </li>
          <li>• Previous unpaid amounts are automatically carried forward</li>
          <li>
            • Due dates are typically set to the 5th of the following month
          </li>
          <li>• Deposit payments are excluded from rent calculations</li>
        </ul>
      </div>
    </div>
  );
};

export default DueManagement;
