"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";

interface User {
  _id: string;
  name: string;
  email: string;
  pgId: string;
  phone?: string;
  roomId?:
    | {
        _id: string;
        roomNumber: string;
        type: string;
        price: number;
      }
    | string
    | null;
  isActive: boolean;
  isDeleted?: boolean;
  createdAt: string;
  hasUnpaidDues?: boolean;
  moveInDate: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [filterPayment, setFilterPayment] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/users");

        // Get payment status for active users
        const usersData = response.data.users || [];

        // Fetch payment data to check unpaid dues
        const paymentsResponse = await axios.get("/api/payments/dues");
        const unpaidUserIds = paymentsResponse.data.usersWithDues || [];

        // Mark users with unpaid dues
        const usersWithPaymentInfo = usersData.map((user: User) => ({
          ...user,
          hasUnpaidDues: unpaidUserIds.includes(user._id),
        }));

        setUsers(usersWithPaymentInfo);
        setFilteredUsers(usersWithPaymentInfo);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users data");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search and filter criteria
  useEffect(() => {
    let result = users;

    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.pgId.toLowerCase().includes(searchTerm.toLowerCase())
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

    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, filterStatus, filterPayment, users]);

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    PG ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Room
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Date Joined
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-md divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {currentUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-white/40 dark:hover:bg-gray-700/40 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.phone}
                            </div>
                          )}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.moveInDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/users/${user._id}`}
                          className="text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </Link>

                        {user.hasUnpaidDues && user.isActive && (
                          <button
                            onClick={() => handleSendReminder(user._id)}
                            disabled={sendingReminder === user._id}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:hover:bg-yellow-800/60 transition-colors"
                            title="Send payment reminder"
                          >
                            {sendingReminder === user._id ? (
                              <>
                                <svg
                                  className="animate-spin h-4 w-4 mr-1"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Sending...
                              </>
                            ) : (
                              <>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                </svg>
                                Send Reminder
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {currentUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
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
