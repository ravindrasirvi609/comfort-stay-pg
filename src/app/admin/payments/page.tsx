"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import {
  FaDownload,
  FaFilter,
  FaPlus,
  FaSearch,
  FaSpinner,
  FaFileInvoiceDollar,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
} from "react-icons/fa";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

interface User {
  _id: string;
  name: string;
  email: string;
  pgId: string;
}

interface Payment {
  _id: string;
  userId: string | User;
  amount: number;
  months: string[];
  month?: string; // Virtual field
  status?: string; // Backward compatibility
  paymentStatus: string;
  paymentDate: string;
  receiptNumber: string;
  paymentMethod: string;
  remarks?: string;
  createdAt: string;
  isDepositPayment?: boolean;
}

export default function PaymentsPage() {
  // States
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>(
    new Date().getFullYear().toString()
  );

  // Sum of payments for current filter
  const [totalAmount, setTotalAmount] = useState(0);

  // Generate months array for filter dropdown
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

  // Generate years array for filter dropdown (last 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) =>
    (currentYear - i).toString()
  );

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let result = [...payments];

    // Apply status filter
    if (statusFilter) {
      result = result.filter(
        (payment) =>
          payment.paymentStatus === statusFilter ||
          payment.status === statusFilter
      );
    }

    // Apply month filter
    if (monthFilter) {
      result = result.filter((payment) => {
        if (!payment.months || payment.months.length === 0) return false;

        // Check if any month in the array contains the filter month
        return payment.months.some((monthStr) => {
          const [paymentMonth] = monthStr.split(" ");
          return paymentMonth === monthFilter;
        });
      });
    }

    // Apply year filter
    if (yearFilter) {
      result = result.filter((payment) => {
        if (!payment.months || payment.months.length === 0) return false;

        // Check if any month in the array contains the filter year
        return payment.months.some((monthStr) => {
          const parts = monthStr.split(" ");
          return parts.length > 1 && parts[1] === yearFilter;
        });
      });
    }

    // Apply search term
    if (searchTerm) {
      result = result.filter((payment) => {
        const user = payment.userId as User;
        return (
          (user.name &&
            user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.pgId &&
            user.pgId.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (payment.receiptNumber &&
            payment.receiptNumber
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
        );
      });
    }

    // Calculate total amount for current filter
    const total = result.reduce((sum, payment) => {
      return payment.paymentStatus === "Paid" || payment.status === "Paid"
        ? sum + payment.amount
        : sum;
    }, 0);

    setTotalAmount(total);
    setFilteredPayments(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [payments, statusFilter, monthFilter, yearFilter, searchTerm]);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const response = await axios.get("/api/payments");
      console.log("Payments response:", response.data);

      if (response.data.success) {
        setPayments(response.data.payments);
        setFilteredPayments(response.data.payments);

        // Calculate initial total amount
        const total = response.data.payments.reduce(
          (sum: number, payment: Payment) => {
            return payment.paymentStatus === "Paid" || payment.status === "Paid"
              ? sum + payment.amount
              : sum;
          },
          0
        );

        setTotalAmount(total);
      } else {
        setError("Failed to load payment data");
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError("Failed to load payment data");
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setStatusFilter("");
    setMonthFilter("");
    setYearFilter(new Date().getFullYear().toString());
    setSearchTerm("");
  };

  // Get status badge style
  const getStatusBadge = (payment: Payment) => {
    const status = payment.paymentStatus || payment.status || "Unknown";

    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <FaCheckCircle className="mr-1" />
            Paid
          </span>
        );
      case "Due":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <FaHourglassHalf className="mr-1" />
            Due
          </span>
        );
      case "Overdue":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <FaTimesCircle className="mr-1" />
            Overdue
          </span>
        );
      case "Partial":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <FaHourglassHalf className="mr-1" />
            Partial
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-pink-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 dark:from-pink-400 dark:to-purple-500">
            Payment Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track all resident payments
          </p>
        </div>

        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <FaFilter className="mr-2" />
            Filters
          </button>

          <Link href="/admin/payments/create">
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 dark:bg-pink-700 dark:hover:bg-pink-800 transition-colors duration-200">
              <FaPlus className="mr-2" />
              Add Payment
            </button>
          </Link>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900/50 dark:border-red-800 dark:text-red-400">
          <p>{error}</p>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Total Payments
            </p>
            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
              <FaFileInvoiceDollar className="text-pink-600 dark:text-pink-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {filteredPayments.length}
          </h3>
        </div>

        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Total Amount
            </p>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FaCheckCircle className="text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            ₹{totalAmount.toLocaleString()}
          </h3>
        </div>

        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Pending Payments
            </p>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <FaHourglassHalf className="text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {
              payments.filter(
                (p) =>
                  p.paymentStatus === "Due" ||
                  p.paymentStatus === "Overdue" ||
                  p.status === "Due" ||
                  p.status === "Overdue"
              ).length
            }
          </h3>
        </div>

        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              This Month
            </p>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FaFileInvoiceDollar className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            ₹
            {payments
              .filter((p) => {
                const currentMonth = new Date().toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                });
                return (
                  p.months &&
                  p.months.some((month) => month === currentMonth) &&
                  (p.paymentStatus === "Paid" || p.status === "Paid")
                );
              })
              .reduce((sum, payment) => sum + payment.amount, 0)
              .toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={`mb-6 ${showFilters ? "block" : "hidden"}`}>
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100"
                  placeholder="Search by name or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status filter */}
            <div>
              <select
                className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 text-gray-900 dark:text-gray-100"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Due">Due</option>
                <option value="Overdue">Overdue</option>
                <option value="Partial">Partial</option>
              </select>
            </div>

            {/* Month filter */}
            <div>
              <select
                className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 text-gray-900 dark:text-gray-100"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              >
                <option value="">All Months</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* Year filter */}
            <div>
              <select
                className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 text-gray-900 dark:text-gray-100"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 text-right">
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No payments found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Receipt
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Resident
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Month
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Method
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/20 dark:bg-gray-900/20 divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.map((payment) => {
                  const user = payment.userId as User;
                  return (
                    <tr
                      key={payment._id}
                      className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {payment.receiptNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.pgId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ₹{payment.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {payment.months && payment.months.length > 0
                          ? payment.months.join(", ")
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.isDepositPayment ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                            Deposit
                          </span>
                        ) : payment.months && payment.months.length > 1 ? (
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              Multiple ({payment.months.length})
                            </span>
                            {payment.months && payment.months.length > 0 && (
                              <div className="hidden group-hover:block absolute z-10 bg-white dark:bg-gray-800 p-2 rounded shadow-lg text-xs mt-1">
                                {payment.months.join(", ")}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                            Regular
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(payment.paymentDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {payment.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/payments/${payment._id}`}
                          className="text-pink-600 hover:text-pink-900 dark:text-pink-400 dark:hover:text-pink-300 mr-4"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => {
                            // Download or generate receipt logic here
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <FaDownload className="inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-400">
              Showing{" "}
              <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredPayments.length)}
              </span>{" "}
              of <span className="font-medium">{filteredPayments.length}</span>{" "}
              results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <IoChevronBackOutline className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                // Show only current page, first, last, and 1 page before and after current
                const showPage =
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  Math.abs(pageNumber - currentPage) <= 1;

                // Show ellipsis for gaps
                if (!showPage) {
                  if (pageNumber === 2 || pageNumber === totalPages - 1) {
                    return (
                      <span key={pageNumber} className="px-3 py-2">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`relative inline-flex items-center px-3 py-2 border ${
                      currentPage === pageNumber
                        ? "border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 font-medium"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    } text-sm rounded-md`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <IoChevronForwardOutline className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
