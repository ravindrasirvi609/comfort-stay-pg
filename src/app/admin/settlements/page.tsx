"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FaSearch,
  FaFilter,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaRupeeSign,
} from "react-icons/fa";
import {
  formatSettlementReason,
  SETTLEMENT_REASONS,
} from "@/app/lib/settlementConstants";

interface SettlementItem {
  _id: string;
  month: string;
  amount: number;
  reason: string;
  remarks?: string;
  settledAt: string;
  user: { _id: string; name: string; email: string; pgId: string };
  settledBy: { _id: string; name: string; email: string };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export default function SettlementsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState<SettlementItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [reason, setReason] = useState<string>("");
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, month, year, reason]);

  const fetchData = async (page = pagination.currentPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (month) params.set("month", month);
      if (year) params.set("year", year);
      if (reason) params.set("reason", reason);

      const res = await fetch(`/api/settlements?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");

      setItems(data.settlements);
      setPagination(data.pagination);
      setLoading(false);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to load settlements");
      setLoading(false);
    }
  };

  const totalAmount = useMemo(
    () => items.reduce((sum, s) => sum + (s.amount || 0), 0),
    [items]
  );

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
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

  const onPage = (p: number) => {
    if (p > 0 && p <= pagination.totalPages) fetchData(p);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 dark:from-pink-400 dark:to-purple-500">
            Settled Amounts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            All due settlements by admins
          </p>
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <FaFilter className="mr-2" /> Filters
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded dark:bg-red-900/40 dark:border-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Settlements
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {pagination.totalCount}
          </h3>
        </div>
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Total Settled (page)
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            ₹{totalAmount.toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100"
                  placeholder="Search by resident name or ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div>
              <select
                className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="">All Months</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">All Reasons</option>
                {SETTLEMENT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg overflow-hidden">
        <div className="min-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-white/60 dark:bg-gray-900/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resident
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remarks
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Settled By
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/40 dark:bg-gray-900/30 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    <FaSpinner className="inline animate-spin mr-2" />{" "}
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No settlements found
                  </td>
                </tr>
              ) : (
                items.map((s) => (
                  <tr
                    key={s._id}
                    className="hover:bg-white/60 dark:hover:bg-gray-900/50"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        <Link
                          href={`/admin/users/${s.user._id}`}
                          className="hover:underline"
                        >
                          {s.user.name}
                        </Link>
                      </div>
                      <div className="text-xs text-gray-500">{s.user.pgId}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {s.month}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                      <span className="inline-flex items-center">
                        <FaRupeeSign className="mr-1 opacity-70" />
                        {s.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                      {formatSettlementReason(s.reason)}
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate"
                      title={s.remarks || "-"}
                    >
                      {s.remarks || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                      {s.settledBy?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                      {new Date(s.settledAt).toLocaleString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/60 dark:bg-gray-900/40">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages} •{" "}
            {pagination.totalCount} items
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
              disabled={!pagination.hasPrevPage}
              onClick={() => onPage(pagination.currentPage - 1)}
            >
              <FaChevronLeft />
            </button>
            <button
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
              disabled={!pagination.hasNextPage}
              onClick={() => onPage(pagination.currentPage + 1)}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
