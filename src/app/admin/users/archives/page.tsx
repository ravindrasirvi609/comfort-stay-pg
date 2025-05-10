"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUser,
  FaDownload,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

interface ArchivedUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  pgId: string;
  moveInDate: string;
  moveOutDate: string;
  lastRoom?: string;
  checkoutReason?: string;
  stayDuration?: number;
  profileImage?: string;
}

export default function UserArchivesPage() {
  const [archivedUsers, setArchivedUsers] = useState<ArchivedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ArchivedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState<string>("");
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);

  useEffect(() => {
    const fetchArchivedUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/admin/users/archives");

        if (response.data.success) {
          const users = response.data.archivedUsers || [];
          setArchivedUsers(users);
          setFilteredUsers(users);

          // Extract available years for filtering
          const years = Array.from(
            new Set(
              users.map((user: ArchivedUser) =>
                new Date(user.moveOutDate).getFullYear().toString()
              )
            )
          ).sort((a, b) => Number(b) - Number(a)); // Sort years in descending order

          setAvailableYears(years as string[]);

          // Prepare CSV data
          const csvFormattedData = users.map((user: ArchivedUser) => ({
            Name: user.name,
            Email: user.email,
            Phone: user.phone,
            "PG ID": user.pgId,
            "Move In Date": new Date(user.moveInDate).toLocaleDateString(),
            "Move Out Date": new Date(user.moveOutDate).toLocaleDateString(),
            "Last Room": user.lastRoom || "N/A",
            "Checkout Reason": user.checkoutReason || "N/A",
            "Stay Duration (days)": user.stayDuration || "N/A",
          }));

          setCsvData(csvFormattedData);
        } else {
          setError(response.data.message || "Failed to fetch archived users");
        }
      } catch (error) {
        console.error("Error fetching archived users:", error);
        setError("Failed to load archived users data");
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term and year filter
    let results = [...archivedUsers];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      results = results.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.pgId.toLowerCase().includes(search) ||
          user.phone.includes(search)
      );
    }

    if (filterYear) {
      results = results.filter(
        (user) =>
          new Date(user.moveOutDate).getFullYear().toString() === filterYear
      );
    }

    setFilteredUsers(results);
  }, [searchTerm, filterYear, archivedUsers]);

  const handleExportCSV = () => {
    if (csvData.length === 0) return;

    // Convert CSV data to string
    const headers = Object.keys(csvData[0]).join(",");
    const rows = csvData.map((row) =>
      Object.values(row)
        .map((value) =>
          typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value
        )
        .join(",")
    );

    const csvString = [headers, ...rows].join("\n");

    // Create blob and download link
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `archived-users-${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaTimes className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          User Archives
        </h1>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* CSV Export Button */}
          {csvData.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <FaDownload className="mr-2" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaSearch className="text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Search by name, email, ID, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Year Filter */}
          <div className="w-full md:w-48">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaCalendarAlt className="text-gray-400" />
              </span>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="">All Years</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Filters Button */}
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterYear("");
            }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Showing {filteredUsers.length} of {archivedUsers.length} archived users
      </div>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
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
                    Stay Period
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Duration
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Last Room
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Checkout Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <FaUser className="text-gray-500 dark:text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {user.pgId} | {user.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(user.moveInDate).toLocaleDateString()} -{" "}
                        {new Date(user.moveOutDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.stayDuration
                          ? `${user.stayDuration} days`
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.lastRoom || "Not recorded"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.checkoutReason || "Not specified"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 text-center">
          <FaUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No archived users found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {archivedUsers.length > 0
              ? "No users match your current filters. Try adjusting your search criteria."
              : "There are no archived users in the system yet."}
          </p>
        </div>
      )}
    </div>
  );
}
