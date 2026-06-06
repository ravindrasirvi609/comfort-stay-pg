"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaDownload,
  FaFilter,
  FaSearch,
  FaSpinner,
  FaUserSlash,
  FaCalendarAlt,
  FaHome,
  FaBed,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaFileExport,
  FaWhatsapp,
} from "react-icons/fa";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import Link from "next/link";

interface Room {
  _id: string;
  roomNumber: string;
  building: string;
  floor: number;
  type: string;
  rentAmount: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  pgId: string;
  roomId: Room;
  bedNumber: number;
  joinDate: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface Summary {
  totalUsersWithoutPayment: number;
  totalActiveUsers: number;
  percentageWithoutPayment: string;
  monthYear: string;
}

export default function MissingPaymentsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 20,
  });
  const [summary, setSummary] = useState<Summary | null>(null);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [showFilters, setShowFilters] = useState(false);

  // Generate months and years
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

  const currentDate = new Date();
  const currentMonth = months[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const years = Array.from(
    { length: 5 },
    (_, i) => currentYear - 2 + i
  ).reverse();

  useEffect(() => {
    // Set default to current month and year
    if (!selectedMonth) setSelectedMonth(currentMonth);
    if (!selectedYear) setSelectedYear(currentYear.toString());
  }, []);

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchMissingPayments();
    }
  }, [
    selectedMonth,
    selectedYear,
    pagination.currentPage,
    searchQuery,
    selectedBuilding,
    selectedStatus,
  ]);

  const fetchMissingPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        month: selectedMonth,
        year: selectedYear,
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchQuery) params.append("search", searchQuery);
      if (selectedBuilding) params.append("building", selectedBuilding);
      if (selectedStatus) params.append("status", selectedStatus);

      const response = await axios.get(
        `/api/admin/missing-payments?${params.toString()}`
      );

      if (response.data.success) {
        setUsers(response.data.data);
        setPagination(response.data.pagination);
        setSummary(response.data.summary);
      }
    } catch (error: any) {
      console.error("Error fetching missing payments:", error);
      alert(
        error.response?.data?.message || "Failed to fetch missing payments"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchMissingPayments();
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await axios.post("/api/admin/missing-payments", {
        month: selectedMonth,
        year: selectedYear,
      });

      if (response.data.success) {
        // Create CSV content
        const data = response.data.data;
        const csvRows = [
          [
            "Name",
            "Email",
            "Phone",
            "Building",
            "Room",
            "Bed",
            "Rent Amount",
            "Month",
          ],
        ];

        data.missingPaymentUsers.forEach((user: any) => {
          csvRows.push([
            user.pgId || "N/A",
            user.name,
            user.email,
            user.phone,
            user.roomId?.building || "N/A",
            user.roomId?.roomNumber || "N/A",
            user.bedNumber || "N/A",
            user.roomId?.rentAmount || "0",
            data.monthYear,
          ]);
        });

        const csvContent = csvRows.map((row) => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `missing-payments-${selectedMonth}-${selectedYear}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error: any) {
      console.error("Error exporting data:", error);
      alert(error.response?.data?.message || "Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString("en-IN")}`;

  const normalizeWhatsAppPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");

    if (digits.length === 10) {
      return `91${digits}`;
    }

    return digits;
  };

  const handleSendReminder = (user: User) => {
    const whatsappPhone = normalizeWhatsAppPhone(user.phone || "");

    if (!whatsappPhone) {
      alert("This user does not have a valid phone number.");
      return;
    }

    const message = [
      `Hello ${user.name},`,
      "",
      `This is a rent reminder from Comfort Stay PG for ${selectedMonth} ${selectedYear}.`,
    ].join("\n");

    window.open(
      `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 dark:from-gray-900 dark:to-gray-800 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-2xl font-bold leading-tight text-gray-900 dark:text-white sm:gap-3 md:text-4xl">
                <FaUserSlash className="shrink-0 text-red-500" />
                <span className="break-words">Missing Payments</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                Track users without payment entries for selected month
              </p>
            </div>
            <Link
              href="/admin"
              className="inline-flex w-full items-center justify-center rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 sm:w-auto"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
              <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800 sm:p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Missing Payments
                    </p>
                    <p className="text-2xl font-bold text-red-600 break-words">
                      {summary.totalUsersWithoutPayment}
                    </p>
                  </div>
                  <FaExclamationTriangle className="shrink-0 text-2xl text-red-500 sm:text-3xl" />
                </div>
              </div>

              <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800 sm:p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Active Users
                    </p>
                    <p className="text-2xl font-bold text-blue-600 break-words">
                      {summary.totalActiveUsers}
                    </p>
                  </div>
                  <FaHome className="shrink-0 text-2xl text-blue-500 sm:text-3xl" />
                </div>
              </div>

              <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800 sm:p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Missing Percentage
                    </p>
                    <p className="text-2xl font-bold text-orange-600 break-words">
                      {summary.percentageWithoutPayment}%
                    </p>
                  </div>
                  <FaMoneyBillWave className="shrink-0 text-2xl text-orange-500 sm:text-3xl" />
                </div>
              </div>

              <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800 sm:p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Selected Month
                    </p>
                    <p className="break-words text-lg font-bold text-purple-600 sm:text-xl">
                      {summary.monthYear}
                    </p>
                  </div>
                  <FaCalendarAlt className="shrink-0 text-2xl text-purple-500 sm:text-3xl" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
              <FaFilter />
              Filters
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white md:hidden"
            >
              {showFilters ? "Hide" : "Show"} Filters
            </button>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-5 gap-4 ${
              showFilters ? "block" : "hidden md:grid"
            }`}
          >
            {/* Month Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Building Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Building
              </label>
              <select
                value={selectedBuilding}
                onChange={(e) => {
                  setSelectedBuilding(e.target.value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Buildings</option>
                <option value="A">Building A</option>
                <option value="B">Building B</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="active">Active Users</option>
                <option value="inactive">Inactive Users</option>
              </select>
            </div>

            {/* Export Button */}
            <div className="flex items-end">
              <button
                onClick={handleExport}
                disabled={exporting || loading}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {exporting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FaFileExport />
                    Export CSV
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-12 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </form>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-4xl text-blue-500" />
            </div>
          ) : users.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <FaUserSlash className="mx-auto mb-4 text-5xl text-gray-400 sm:text-6xl" />
              <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300 sm:text-xl">
                No Missing Payments Found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
                All active users have payment entries for {selectedMonth}{" "}
                {selectedYear}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px]">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Room Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Rent Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/admin/users/${user._id}`}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer transition"
                          >
                            {user.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {user.email}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm">
                            <FaHome className="text-gray-400" />
                            <span className="text-gray-900 dark:text-white">
                              {user.roomId?.building || "N/A"}-
                              {user.roomId?.roomNumber || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <FaBed className="text-gray-400" />
                            Bed {user.bedNumber || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            ₹{user.roomId?.rentAmount || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleSendReminder(user)}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                          >
                            <FaWhatsapp />
                            Send Reminder
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700 md:hidden">
                {users.map((user) => (
                  <div key={user._id} className="p-4">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/admin/users/${user._id}`}
                          className="break-words text-base font-semibold text-blue-600 transition hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {user.name}
                        </Link>
                      
                      </div>
                      <div className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-300">
                        Missing
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Contact
                        </p>
                        <p className="break-words text-gray-900 dark:text-white">
                          {user.email || "N/A"}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          {user.phone || "N/A"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Room
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-gray-900 dark:text-white">
                            <FaHome className="shrink-0 text-gray-400" />
                            <span className="break-words">
                              {user.roomId?.building || "N/A"}-
                              {user.roomId?.roomNumber || "N/A"}
                            </span>
                          </div>
                        </div>

                        
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Rent Amount
                        </p>
                        <p className="mt-1 font-semibold text-green-600">
                          ₹{user.roomId?.rentAmount || 0}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendReminder(user)}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-600"
                    >
                      <FaWhatsapp />
                      Send Reminder
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col gap-4 bg-gray-50 px-4 py-4 dark:bg-gray-700 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="text-center text-sm text-gray-700 dark:text-gray-300 sm:text-left">
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.currentPage * pagination.limit,
                      pagination.totalCount
                    )}{" "}
                    of {pagination.totalCount} users
                  </div>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={!pagination.hasPrevPage}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <IoChevronBackOutline />
                    </button>
                    <span className="rounded-lg bg-blue-500 px-4 py-2 text-white">
                      {pagination.currentPage}
                    </span>
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={!pagination.hasNextPage}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <IoChevronForwardOutline />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
