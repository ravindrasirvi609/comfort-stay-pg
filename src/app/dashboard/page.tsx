"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface User {
  _id: string;
  name: string;
  email: string;
  pgId: string;
  phone: string;
  roomId: {
    _id: string;
    roomNumber: string;
    type: string;
    price: number;
  } | null;
  moveInDate: string;
}

interface Payment {
  _id: string;
  amount: number;
  month: string;
  status: string;
  paymentDate: string;
  receiptNumber: string;
}

interface Complaint {
  _id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

interface Notice {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  createdBy: {
    name: string;
  };
}

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch current user
        const userResponse = await axios.get("/api/auth/me");
        if (userResponse.data.success) {
          setUser(userResponse.data.user);
        }

        // Fetch payments
        const paymentsResponse = await axios.get("/api/payments");
        if (paymentsResponse.data.success) {
          setPayments(paymentsResponse.data.payments || []);
        }

        // Fetch complaints
        const complaintsResponse = await axios.get("/api/complaints");
        if (complaintsResponse.data.success) {
          setComplaints(complaintsResponse.data.complaints || []);
        }

        // Fetch notices
        const noticesResponse = await axios.get("/api/notices");
        if (noticesResponse.data.success) {
          setNotices(noticesResponse.data.notices || []);
        }

        setLoading(false);
      } catch (err: unknown) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:text-red-200 dark:border-red-800"
        role="alert"
      >
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  // Get current month for displaying payment status
  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const currentMonthPayment = payments.find(
    (payment) => payment.month === currentMonth
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Welcome, {user?.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Profile Information
          </h2>

          {user && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {user.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">PG ID:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {user.pgId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {user.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {user.phone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Move-in Date:
                </span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {new Date(user.moveInDate).toLocaleDateString()}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/dashboard/profile"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Room Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Room Information
          </h2>

          {user?.roomId ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Room Number:
                </span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {user.roomId.roomNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Room Type:
                </span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {user.roomId.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Monthly Rent:
                </span>
                <span className="text-gray-900 dark:text-white font-medium">
                  ₹{user.roomId.price.toLocaleString()}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Payment Status ({currentMonth}):
                  </span>
                  {currentMonthPayment ? (
                    <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-xs font-medium">
                      Paid
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 rounded-full text-xs font-medium">
                      Due
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No room assigned yet. Please contact the admin.
            </p>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Recent Payments
          </h2>

          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Receipt
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {payments.slice(0, 5).map((payment) => (
                    <tr key={payment._id}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {payment.month}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ₹{payment.amount}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                          {payment.receiptNumber}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No payment records found
            </p>
          )}

          <div className="mt-4">
            <Link
              href="/dashboard/payments"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all payments
            </Link>
          </div>
        </div>

        {/* Complaints */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              My Complaints
            </h2>
            <Link href="/dashboard/complaints/new">
              <div className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold py-1 px-3 rounded">
                New Complaint
              </div>
            </Link>
          </div>

          {complaints.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {complaints.slice(0, 3).map((complaint) => (
                    <tr key={complaint._id}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {complaint.title}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            complaint.status === "Open"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : complaint.status === "In Progress"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          }`}
                        >
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No complaints filed yet
            </p>
          )}

          <div className="mt-4">
            <Link
              href="/dashboard/complaints"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all complaints
            </Link>
          </div>
        </div>

        {/* Notices */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Notices
          </h2>

          {notices.length > 0 ? (
            <div className="space-y-4">
              {notices.slice(0, 3).map((notice) => (
                <div
                  key={notice._id}
                  className="border-l-4 border-pink-500 pl-4 py-2"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {notice.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    {notice.description}
                  </p>
                  <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>Posted by: {notice.createdBy.name}</span>
                    <span>
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No notices available
            </p>
          )}

          <div className="mt-4">
            <Link
              href="/dashboard/notices"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all notices
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
