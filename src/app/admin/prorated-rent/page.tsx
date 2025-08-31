"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface EnhancedUser {
  _id: string;
  name: string;
  email: string;
  pgId: string;
  roomId?: {
    _id: string;
    roomNumber: string;
    type: string;
    price: number;
  };
  isActive: boolean;
  moveInDate: string;
  currentMonthRentStatus: "Paid" | "Unpaid" | "N/A";
  dueAmount: number;
  totalDue: number;
  currentMonthDue: number;
  previousUnpaidDue: number;
  isProrated: boolean;
  daysCovered?: number;
  totalDaysInMonth?: number;
  checkInDate?: string;
  proratedRent?: number;
  fullMonthRent?: number;
  dueStatus: string;
  dueDate?: string;
  creditBalance?: number;
  netDue?: number;
}

interface Summary {
  paidCount: number;
  unpaidCount: number;
  totalUnpaidAmount: number;
  currentMonthDue: number;
  previousUnpaidDue: number;
  totalCreditAmount?: number;
  usersWithCredit?: number;
}

interface DueStats {
  totalDues: number;
  totalAmount: number;
  paidCount: number;
  unpaidCount: number;
  partialCount: number;
}

export default function ProratedRentPage() {
  const router = useRouter();
  const [users, setUsers] = useState<EnhancedUser[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "actions">(
    "overview"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "paid" | "unpaid" | "prorated"
  >("all");
  const [stats, setStats] = useState<DueStats | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Generate current month/year options
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    setSelectedMonth(currentMonth.toString());
    setSelectedYear(currentYear.toString());
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        axios.get("/api/users/with-dues?status=active"),
        axios.get("/api/user-dues/recalculate"),
      ]);

      setUsers(usersResponse.data.users || []);
      setSummary(usersResponse.data.summary || null);
      setStats(statsResponse.data.stats || null);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
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
      toast.success(`✅ Processed ${results.success} users successfully!`);

      if (results.failed > 0) {
        toast.error(`❌ ${results.failed} users failed to process`);
      }

      await fetchData();
    } catch (error: any) {
      console.error("Error generating dues:", error);
      toast.error("Failed to generate dues");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount?.toLocaleString("en-IN") || "0"}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const handleUserClick = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  // Filter users based on search and status
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.pgId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "paid" && user.currentMonthRentStatus === "Paid") ||
      (filterStatus === "unpaid" && user.currentMonthRentStatus === "Unpaid") ||
      (filterStatus === "prorated" && user.isProrated);

    return matchesSearch && matchesStatus;
  });

  const monthOptions = [
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading rent management data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            � Rent Collection Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and collect pending rent payments from users
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: "overview", name: "📊 Overview", icon: "📊" },
              { id: "users", name: "👥 Users", icon: "👥" },
              { id: "actions", name: "⚡ Actions", icon: "⚡" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? "border-pink-500 text-pink-600 dark:text-pink-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-3xl font-bold text-green-700 dark:text-green-400 mb-2">
                    {summary.paidCount}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-400 font-medium">
                    ✅ Users Paid This Month
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-500 mt-1">
                    No action needed
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="text-3xl font-bold text-red-700 dark:text-red-400 mb-2">
                    {summary.unpaidCount}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-400 font-medium">
                    ⚠️ Users Need to Pay
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-500 mt-1">
                    Send payment reminders
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-2">
                    {formatCurrency(summary.totalUnpaidAmount)}
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-400 font-medium">
                    💸 Total to Collect
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-500 mt-1">
                    This is your focus
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Overview */}
            {summary && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  � Money to Collect This Month
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="text-sm text-red-700 dark:text-red-400 mb-2 font-medium">
                      💸 Total Amount Pending
                    </div>
                    <div className="text-3xl font-bold text-red-700 dark:text-red-400">
                      {formatCurrency(summary.totalUnpaidAmount)}
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-500 mt-2">
                      This is what users actually owe
                    </div>
                  </div>

                  {summary.previousUnpaidDue > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="text-sm text-orange-700 dark:text-orange-400 mb-2 font-medium">
                        ⏳ Old Pending Amount
                      </div>
                      <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                        {formatCurrency(summary.previousUnpaidDue)}
                      </div>
                      <div className="text-xs text-orange-600 dark:text-orange-500 mt-2">
                        From previous months
                      </div>
                    </div>
                  )}

                  {summary.totalCreditAmount &&
                    summary.totalCreditAmount > 0 && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-sm text-green-700 dark:text-green-400 mb-2 font-medium">
                          � Credit Available
                        </div>
                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                          {formatCurrency(summary.totalCreditAmount)}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-500 mt-2">
                          Users have overpaid
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Simple Explanation */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center">
                💡 What You Need to Know
              </h3>
              <div className="text-blue-800 dark:text-blue-300 space-y-2 text-sm">
                <p className="text-lg font-semibold">
                  📋 Total to collect:{" "}
                  <span className="text-red-700 dark:text-red-400">
                    {formatCurrency(summary?.totalUnpaidAmount || 0)}
                  </span>
                </p>
                <p>• This is the exact amount users need to pay</p>
                <p>• Already includes previous unpaid amounts</p>
                <p>• Already deducted any credit balances</p>
                <p className="text-blue-700 dark:text-blue-400 font-medium">
                  🎯 Focus on collecting this amount from users marked as
                  "Unpaid"
                </p>
              </div>
            </div>

            {/* What is Prorated Rent? */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
                🤔 What is Prorated Rent?
              </h3>
              <div className="text-blue-800 dark:text-blue-300 space-y-2">
                <p>
                  • <strong>Fair Billing:</strong> Users pay only for the days
                  they actually stay
                </p>
                <p>
                  • <strong>Mid-month Check-in:</strong> If someone checks in on
                  15th, they pay for remaining days only
                </p>
                <p>
                  • <strong>Automatic Calculation:</strong> System calculates:
                  (Monthly Rent ÷ Days in Month) × Days Stayed
                </p>
                <p>
                  • <strong>Credit System:</strong> Overpayments are
                  automatically credited to next month
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    🔍 Search Users
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, or PG ID..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    🏷️ Filter by Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Users</option>
                    <option value="paid">✅ Paid</option>
                    <option value="unpaid">❌ Unpaid</option>
                    <option value="prorated">📅 Prorated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  👥 Users ({filteredUsers.length})
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  💡 Click on any user to view their detailed profile
                </p>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.slice(0, 20).map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleUserClick(user._id)}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      {/* User Info */}
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-pink-700 dark:text-pink-300">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.pgId} • Room{" "}
                            {user.roomId?.roomNumber || "No Room"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Joined: {formatDate(user.moveInDate)}
                          </div>
                        </div>
                      </div>

                      {/* Due Info */}
                      <div className="text-right">
                        <div className="flex items-center space-x-3">
                          {/* Status Badge */}
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              user.currentMonthRentStatus === "Paid"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {user.currentMonthRentStatus === "Paid"
                              ? "✅ Paid"
                              : "❌ Unpaid"}
                          </span>

                          {/* Prorated Badge */}
                          {user.isProrated && (
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              📅 Prorated ({user.daysCovered}/
                              {user.totalDaysInMonth} days)
                            </span>
                          )}

                          {/* Click indicator */}
                          <span className="text-gray-400 dark:text-gray-500 text-lg">
                            →
                          </span>
                        </div>

                        {/* Amount Due */}
                        <div className="mt-2">
                          {user.currentMonthRentStatus === "Unpaid" && (
                            <div className="text-xl font-bold text-red-600 dark:text-red-400">
                              {formatCurrency(user.dueAmount || user.totalDue)}
                            </div>
                          )}
                          {user.isProrated && (
                            <div className="text-sm text-blue-600 dark:text-blue-400">
                              Prorated: {formatCurrency(user.proratedRent || 0)}
                              <br />
                              <span className="text-gray-500">
                                (Full:{" "}
                                {formatCurrency(
                                  user.fullMonthRent || user.roomId?.price || 0
                                )}
                                )
                              </span>
                            </div>
                          )}
                          {user.creditBalance && user.creditBalance > 0 && (
                            <div className="text-sm text-green-600 dark:text-green-400">
                              💳 Credit: {formatCurrency(user.creditBalance)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No users found matching your search criteria.
                </div>
              )}

              {filteredUsers.length > 20 && (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                  Showing first 20 of {filteredUsers.length} users. Use search
                  to narrow down results.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === "actions" && (
          <div className="space-y-6">
            {/* Generate Dues */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                ⚡ Generate Monthly Rent Dues
              </h3>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">💡</span>
                  <div className="text-blue-800 dark:text-blue-300">
                    <p className="font-medium mb-2">What does this do?</p>
                    <ul className="text-sm space-y-1">
                      <li>
                        • Calculates rent for all active users for the selected
                        month
                      </li>
                      <li>
                        • Automatically applies prorated calculation for
                        mid-month check-ins
                      </li>
                      <li>• Adds any previous unpaid amounts</li>
                      <li>• Creates due records for payment tracking</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📅 Select Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                  >
                    {monthOptions.map((month, index) => (
                      <option key={index + 1} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📅 Select Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                  >
                    {[currentYear - 1, currentYear, currentYear + 1].map(
                      (year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={generateDuesForMonth}
                    disabled={isGenerating}
                    className="w-full px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 focus:ring-4 focus:ring-pink-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isGenerating ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </div>
                    ) : (
                      "⚡ Generate Dues"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* System Stats */}
            {stats && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📊 System Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalDues}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Due Records
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.paidCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Paid
                    </div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {stats.unpaidCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Unpaid
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {stats.partialCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Partial
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Refresh Data */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    🔄 Refresh Data
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Reload all data from the database to see latest updates
                  </p>
                </div>
                <button
                  onClick={fetchData}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
