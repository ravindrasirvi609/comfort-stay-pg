"use client";

import React, { useEffect, useState } from "react";
import { formatDate } from "@/utils/formatDate";
import CustomSelect from "@/components/CustomSelect";
import { FaSpinner } from "react-icons/fa";

// Expense type based on IExpense interface and API response
interface Expense {
  _id: string;
  amount: number;
  category: "Food" | "Maintenance" | "Utilities" | "Other";
  description: string;
  date: string;
  createdBy?: { name?: string; email?: string };
  status: "Pending" | "Approved" | "Rejected";
  createdAt?: string;
  updatedAt?: string;
}

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "Food", label: "Food" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Utilities", label: "Utilities" },
  { value: "Other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      if (data.success) {
        setExpenses(data.expenses);
      } else {
        setError(data.message || "Failed to fetch expenses");
      }
    } catch {
      setError("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(
    expenseId: string,
    newStatus: "Approved" | "Rejected"
  ) {
    setActionLoading(expenseId + newStatus);
    try {
      const res = await fetch("/api/expenses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenseId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setExpenses((prev) =>
          prev.map((exp) =>
            exp._id === expenseId ? { ...exp, status: newStatus } : exp
          )
        );
      } else {
        alert(data.message || "Failed to update expense");
      }
    } catch {
      alert("Failed to update expense");
    } finally {
      setActionLoading("");
    }
  }

  const filteredExpenses = expenses.filter((exp) => {
    return (
      (!category || exp.category === category) &&
      (!status || exp.status === status)
    );
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/40 rounded-2xl p-6 mb-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                Expenses Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View, filter, and manage all expenses
              </p>
            </div>
          </div>
        </div>
        {/* Filters */}
        <div className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/40 rounded-2xl p-4 mb-6 border border-white/20 dark:border-gray-700/30 shadow-lg flex flex-col sm:flex-row gap-4 items-center overflow-visible">
          <CustomSelect
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
            placeholder="Category"
          />
          <CustomSelect
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
            placeholder="Status"
          />
          <button
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold shadow hover:from-pink-600 hover:to-purple-700 transition disabled:opacity-60"
            onClick={fetchExpenses}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
        {/* Main Content Card */}
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <FaSpinner className="animate-spin text-4xl text-pink-600" />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-12">
              <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md dark:bg-red-900/60 dark:text-red-200 dark:border-red-700"
                role="alert"
              >
                <span className="font-medium">{error}</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-md divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        No expenses found.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((exp) => (
                      <tr
                        key={exp._id}
                        className="hover:bg-white/40 dark:hover:bg-gray-700/40 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                          ₹{exp.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {exp.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {exp.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {formatDate(exp.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {exp.createdBy?.name || "-"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {exp.createdBy?.email || ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              exp.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : exp.status === "Approved"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {exp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {exp.status === "Pending" && (
                            <div className="flex gap-2">
                              <button
                                className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 font-semibold transition flex items-center"
                                disabled={
                                  actionLoading === exp._id + "Approved"
                                }
                                onClick={() =>
                                  handleAction(exp._id, "Approved")
                                }
                              >
                                {actionLoading === exp._id + "Approved" ? (
                                  <FaSpinner className="animate-spin mr-2 text-green-600" />
                                ) : null}
                                {actionLoading === exp._id + "Approved"
                                  ? "Approving..."
                                  : "Approve"}
                              </button>
                              <button
                                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 font-semibold transition flex items-center"
                                disabled={
                                  actionLoading === exp._id + "Rejected"
                                }
                                onClick={() =>
                                  handleAction(exp._id, "Rejected")
                                }
                              >
                                {actionLoading === exp._id + "Rejected" ? (
                                  <FaSpinner className="animate-spin mr-2 text-red-600" />
                                ) : null}
                                {actionLoading === exp._id + "Rejected"
                                  ? "Rejecting..."
                                  : "Reject"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
