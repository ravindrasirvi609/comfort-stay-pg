"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

interface Expense {
  _id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ManagerExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/expenses?mine=true");
      setExpenses(response.data.expenses || []);
      setLoading(false);
    } catch {
      setError("Failed to load expenses");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            My Expenses
          </h1>
          <Link href="/manager/expenses/create">
            <button className="px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition">
              + Add Expense
            </button>
          </Link>
        </div>
        {error && (
          <div className="mb-4 text-red-600 bg-red-100 rounded p-2">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <span className="text-pink-600">Loading...</span>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td className="px-4 py-2">₹{expense.amount}</td>
                    <td className="px-4 py-2">{expense.category}</td>
                    <td className="px-4 py-2">{expense.description}</td>
                    <td className="px-4 py-2">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          expense.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : expense.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {expenses.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No expenses found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
