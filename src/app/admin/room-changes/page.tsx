"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  FaExchangeAlt,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

interface RoomChange {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    pgId: string;
  };
  oldRoomId: {
    _id: string;
    roomNumber: string;
    type: string;
  };
  newRoomId: {
    _id: string;
    roomNumber: string;
    type: string;
  };
  oldBedNumber: number;
  newBedNumber: number;
  status: "Completed" | "Cancelled";
  requestedAt: string;
  completedAt: string;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function RoomChangesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [roomChanges, setRoomChanges] = useState<RoomChange[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRoomChanges(pagination.page);
  }, []);

  const fetchRoomChanges = async (page: number) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/room-changes?page=${page}&limit=${pagination.limit}`
      );

      if (response.data.success) {
        setRoomChanges(response.data.roomChanges);
        setPagination(response.data.pagination);
      } else {
        setError("Failed to load room changes");
      }
    } catch (err) {
      console.error("Error fetching room changes:", err);
      setError("Failed to load room changes");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchRoomChanges(newPage);
    }
  };

  const handleViewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          <FaExchangeAlt className="inline-block mr-2" />
          Room Change History
        </h1>

        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or PG ID..."
            className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg overflow-hidden">
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
                  From Room
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  To Room
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : roomChanges.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No room changes found
                  </td>
                </tr>
              ) : (
                roomChanges
                  .filter(
                    (change) =>
                      search === "" ||
                      change.userId.name
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      change.userId.pgId
                        .toLowerCase()
                        .includes(search.toLowerCase())
                  )
                  .map((change) => (
                    <tr
                      key={change._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div
                              className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer hover:text-purple-600 dark:hover:text-purple-400"
                              onClick={() => handleViewUser(change.userId._id)}
                            >
                              {change.userId.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {change.userId.pgId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          Room {change.oldRoomId.roomNumber}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Bed #{change.oldBedNumber} • {change.oldRoomId.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          Room {change.newRoomId.roomNumber}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Bed #{change.newBedNumber} • {change.newRoomId.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(change.completedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400">
                          {change.status}
                        </span>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {!loading && roomChanges.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium ${
                  pagination.page === 1
                    ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <FaChevronLeft className="mr-1" />
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className={`inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium ${
                  pagination.page >= pagination.totalPages
                    ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Next
                <FaChevronRight className="ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
