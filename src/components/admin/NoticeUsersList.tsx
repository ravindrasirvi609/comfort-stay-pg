"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { format, isValid } from "date-fns";
import { FaCalendarTimes, FaExclamationTriangle, FaEye } from "react-icons/fa";

interface User {
  _id: string;
  name: string;
  pgId: string;
  email: string;
  phone: string;
  lastStayingDate: string;
  roomId?: {
    _id: string;
    roomNumber: string;
  } | null;
  bedNumber?: number;
}

export default function NoticeUsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsersOnNotice = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/users?isOnNoticePeriod=true");
        setUsers(response.data.users || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users on notice:", err);
        setError("Failed to load users on notice");
        setLoading(false);
      }
    };

    fetchUsersOnNotice();
  }, []);

  // Helper function to safely format dates
  const safeFormatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not specified";

    const date = new Date(dateString);
    return isValid(date) ? format(date, "dd MMM yyyy") : "Invalid date";
  };

  // Helper function to safely calculate days remaining
  const calculateDaysRemaining = (dateString: string | null | undefined) => {
    if (!dateString) return 0;

    const lastDate = new Date(dateString);

    if (!isValid(lastDate)) return 0;

    const today = new Date();
    return Math.ceil(
      (lastDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="h-6 w-6 border-2 border-pink-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-blue-700 dark:text-blue-300 flex items-center">
        <FaExclamationTriangle className="mr-2" />
        No users are currently on notice period
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white/60 dark:bg-gray-800/40 backdrop-blur-md shadow">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center">
          <FaCalendarTimes className="mr-2 text-red-500" />
          Users on Notice Period ({users.length})
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          List of users who have submitted their notice to vacate
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                PG ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Room
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Last Staying Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Days Remaining
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => {
              const daysRemaining = calculateDaysRemaining(
                user.lastStayingDate
              );

              return (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.pgId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.roomId ? (
                      <>
                        Room {user.roomId.roomNumber}
                        {user.bedNumber && ` • Bed ${user.bedNumber}`}
                      </>
                    ) : (
                      "Not assigned"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {safeFormatDate(user.lastStayingDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        daysRemaining <= 7
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          : daysRemaining <= 15
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      }`}
                    >
                      {daysRemaining} days
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/users/${user._id}`}
                      className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 inline-flex items-center"
                    >
                      <FaEye className="mr-1" /> View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
