"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import Image from "next/image";

// Define PaymentData interface based on Payment model
interface PaymentData {
  _id: string;
  userId: { id: string; _id: string } | null; // Allow null and ensure _id is also potentially there
  amount: number;
  months: string[]; // Corrected from month to months
  paymentDate: string; // or Date
  paymentStatus: "Paid" | "Due" | "Overdue" | "Partial" | "Pending";
  isDepositPayment?: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  pgId: string;
  phone?: string;
  profileImage?: string;
  roomId?:
    | {
        _id: string;
        roomNumber: string;
        type: string;
        price: number; // Rent amount
      }
    | string
    | null;
  isActive: boolean;
  isDeleted?: boolean;
  createdAt: string;
  hasUnpaidDues?: boolean; // General dues flag
  moveInDate: string;
  currentMonthRentStatus?: "Paid" | "Unpaid" | "N/A"; // New field
}

interface SortConfig {
  key: keyof User | "currentMonthRentStatus" | null; // Added new sort key
  direction: "ascending" | "descending";
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [allPayments, setAllPayments] = useState<PaymentData[]>([]); // To store all fetched payments
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [filterPayment, setFilterPayment] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "ascending",
  });
  const { toast } = useToast();
  const router = useRouter();

  // Fetch users and payments data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch users
        const usersResponse = await axios.get("/api/users");
        const usersData = usersResponse.data.users || [];

        // Fetch all non-deposit payments
        const paymentsResponse = await axios.get("/api/payments");
        const allFetchedPayments: PaymentData[] =
          paymentsResponse.data.payments || [];
        setAllPayments(allFetchedPayments); // Store for potential future use, though processeduser uses it directly

        // Get current month and year in "Month YYYY" format (e.g., "July 2024")
        const currentDate = new Date();
        const currentMonthYear = `${currentDate.toLocaleString("default", { month: "long" })} ${currentDate.getFullYear()}`;
        console.log("currentMonthYear", currentMonthYear);

        const processedUsers = usersData.map((user: User) => {
          let rentStatus: User["currentMonthRentStatus"] = "N/A";
          const roomPrice =
            typeof user.roomId === "object" && user.roomId?.price
              ? user.roomId.price
              : 0;
          console.log("roomPrice", roomPrice);

          if (roomPrice > 0) {
            const userPaymentsForCurrentMonth = allFetchedPayments.filter(
              (p) =>
                p.userId && // Important: Check if userId is not null
                p.userId.id === user._id && // Using .id as per your last change, ensure this is correct from API population
                !p.isDepositPayment &&
                p.months.includes(currentMonthYear) // Corrected to use p.months
            );

            // Refined logic: Sum all 'Paid' payments for the current month
            let totalAmountPaidForCurrentMonth = 0;
            for (const payment of userPaymentsForCurrentMonth) {
              if (payment.paymentStatus === "Paid") {
                totalAmountPaidForCurrentMonth += payment.amount;
              }
            }

            if (totalAmountPaidForCurrentMonth >= roomPrice) {
              rentStatus = "Paid";
            } else {
              rentStatus = "Unpaid"; // Even if partially paid but less than full roomPrice
            }
          }

          return {
            ...user,
            currentMonthRentStatus: rentStatus,
          };
        });

        setUsers(processedUsers);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load user or payment data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort users
  useEffect(() => {
    let result = [...users]; // Create a new array to avoid mutating the original

    // Filtering logic (existing)
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.pgId &&
            user.pgId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus !== "all") {
      if (filterStatus === "active") {
        result = result.filter((user) => user.isActive === true);
      } else if (filterStatus === "inactive") {
        result = result.filter(
          (user) => user.isActive === false && !user.isDeleted
        );
      } else if (filterStatus === "deleted") {
        result = result.filter((user) => user.isDeleted === true);
      }
    }

    if (filterPayment !== "all") {
      const hasUnpaidDues = filterPayment === "unpaid";
      result = result.filter((user) => user.hasUnpaidDues === hasUnpaidDues);
    }

    // Sorting logic
    if (sortConfig.key !== null) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof User]; // Type assertion for standard keys
        const bValue = b[sortConfig.key as keyof User];

        // Handle currentMonthRentStatus sorting specifically
        if (sortConfig.key === "currentMonthRentStatus") {
          const order = { Paid: 1, Unpaid: 2, "N/A": 3 };
          const aStatus = a.currentMonthRentStatus || "N/A";
          const bStatus = b.currentMonthRentStatus || "N/A";
          return sortConfig.direction === "ascending"
            ? order[aStatus] - order[bStatus]
            : order[bStatus] - order[aStatus];
        }

        // Handle cases where values might be null, undefined or need specific comparison
        if (aValue === null || aValue === undefined)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (bValue === null || bValue === undefined)
          return sortConfig.direction === "ascending" ? 1 : -1;

        // Special handling for roomNumber as it's nested
        if (
          sortConfig.key === "roomId" &&
          typeof aValue === "object" &&
          aValue &&
          typeof bValue === "object" &&
          bValue
        ) {
          const aRoom = (aValue as { roomNumber?: string }).roomNumber || "";
          const bRoom = (bValue as { roomNumber?: string }).roomNumber || "";
          if (aRoom < bRoom)
            return sortConfig.direction === "ascending" ? -1 : 1;
          if (aRoom > bRoom)
            return sortConfig.direction === "ascending" ? 1 : -1;
          return 0;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "ascending"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "boolean" && typeof bValue === "boolean") {
          return sortConfig.direction === "ascending"
            ? aValue === bValue
              ? 0
              : aValue
                ? -1
                : 1
            : aValue === bValue
              ? 0
              : aValue
                ? 1
                : -1;
        }

        // Fallback for numbers or other types
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page on filter or sort change
  }, [searchTerm, filterStatus, filterPayment, users, sortConfig]);

  const requestSort = (key: keyof User | "currentMonthRentStatus") => {
    if (key === "phone") return;
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof User | "currentMonthRentStatus") => {
    if (key === "phone") return "";
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? " ▲" : " ▼";
    }
    return ""; // Or a default "unsorted" icon e.g. <ChevronsUpDown size={14} className="ml-1 inline-block" />
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Function to handle row click
  const handleRowClick = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  // Function to send payment reminder
  const handleSendReminder = async (userId: string) => {
    try {
      setSendingReminder(userId);
      // Call the API endpoint to send payment reminders
      const response = await axios.post(
        `/api/payments/send-reminder/${userId}`
      );

      if (response.data.success) {
        toast.success("Payment reminder sent successfully!");
      } else {
        toast.error(response.data.message || "Failed to send reminder");
      }
    } catch (err) {
      console.error("Error sending payment reminder:", err);
      toast.error("Failed to send payment reminder");
    } finally {
      setSendingReminder(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-pink-500 animate-spin"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/40 rounded-2xl p-6 mb-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                Manage Users
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage all registered users of Comfort Stay PG
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="mb-6 bg-red-100/80 dark:bg-red-900/30 backdrop-blur-sm border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl relative flex items-center"
            role="alert"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="block sm:inline text-sm">{error}</span>
          </div>
        )}

        {/* Filters */}
        <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-6 mb-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search input */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                  placeholder="Search by name, email, or PG ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status filter */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-lg">
                <select
                  className="block w-full pl-3 pr-10 py-2.5 bg-transparent border-0 text-gray-900 dark:text-white focus:outline-none focus:ring-0 sm:text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>
            </div>

            {/* Payment filter */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-lg">
                <select
                  className="block w-full pl-3 pr-10 py-2.5 bg-transparent border-0 text-gray-900 dark:text-white focus:outline-none focus:ring-0 sm:text-sm"
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                >
                  <option value="all">All Payments</option>
                  <option value="unpaid">Unpaid Dues</option>
                  <option value="paid">No Dues</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
              <thead className="bg-white/50 dark:bg-gray-900/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("name")}
                  >
                    User {getSortIndicator("name")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("pgId")}
                  >
                    PG ID {getSortIndicator("pgId")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("roomId")}
                  >
                    Room {getSortIndicator("roomId")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("isActive")}
                  >
                    Status {getSortIndicator("isActive")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("currentMonthRentStatus")}
                  >
                    Current Rent {getSortIndicator("currentMonthRentStatus")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("moveInDate")}
                  >
                    Date Joined {getSortIndicator("moveInDate")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-md divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {currentUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-white/40 dark:hover:bg-gray-700/40 transition-colors duration-200 cursor-pointer"
                    onClick={() => handleRowClick(user._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profileImage ? (
                            <Image
                              src={user.profileImage}
                              alt={user.name}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                        {user.hasUnpaidDues && user.isActive && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                            Unpaid
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.pgId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {typeof user.roomId === "object" &&
                        user.roomId?.roomNumber
                          ? user.roomId.roomNumber
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isDeleted
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200"
                            : user.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                        }`}
                      >
                        {user.isDeleted
                          ? "Deleted"
                          : user.isActive
                            ? "Active"
                            : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.currentMonthRentStatus === "Paid"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                            : user.currentMonthRentStatus === "Unpaid"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200" // For N/A
                        }`}
                      >
                        {user.currentMonthRentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.moveInDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {currentUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={6} // Adjusted colSpan from 5 to 6 (User, PGID, Room, Status, Current Rent, Date Joined)
                      className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No users found matching the criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="bg-white/50 dark:bg-gray-900/50 px-4 py-3 flex items-center justify-between border-t border-gray-200/50 dark:border-gray-700/50 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-gray-800/70 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-gray-800/70 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing{" "}
                    <span className="font-medium">
                      {filteredUsers.length > 0 ? indexOfFirstUser + 1 : 0}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastUser, filteredUsers.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{filteredUsers.length}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          currentPage === index + 1
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-500 dark:border-purple-600"
                            : "bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        } text-sm font-medium`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
