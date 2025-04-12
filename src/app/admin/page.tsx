"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  FiUsers,
  FiHome,
  FiAlertCircle,
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
} from "react-icons/fi";

interface DashboardStats {
  totalUsers: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  pendingComplaints: number;
  rentCollected: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  pgId: string;
  role: string;
  isActive: boolean;
}

interface Room {
  _id: string;
  roomNumber: string;
  status: string;
  type: string;
  price: number;
  capacity: number;
  currentOccupancy: number;
  isActive: boolean;
}

interface Payment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    pgId: string;
  };
  amount: number;
  month: string;
  status: string;
  paymentDate: string;
}

interface Complaint {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    pgId: string;
  };
  title: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    pendingComplaints: 0,
    rentCollected: 0,
  });

  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [pendingComplaints, setPendingComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch users
        const usersResponse = await axios.get("/api/users");
        const users = usersResponse.data.users || [];
        setRecentUsers(users.slice(0, 5));

        // Fetch rooms
        const roomsResponse = await axios.get("/api/rooms");
        const rooms = roomsResponse.data.rooms || [];

        // Fetch payments
        const paymentsResponse = await axios.get("/api/payments");
        const payments = paymentsResponse.data.payments || [];
        setRecentPayments(payments.slice(0, 5));

        // Fetch complaints
        const complaintsResponse = await axios.get(
          "/api/complaints?status=Open"
        );
        const complaints = complaintsResponse.data.complaints || [];
        setPendingComplaints(complaints.slice(0, 5));

        // Calculate stats
        const activeUsers = users.filter((u: User) => u.isActive).length;
        const occupiedRooms = rooms.filter(
          (r: Room) => r.status === "occupied"
        ).length;
        const availableRooms = rooms.filter(
          (r: Room) => r.status === "available"
        ).length;
        const pendingComplaintsCount = complaints.length;

        // Calculate total rent collected this month
        const currentMonth = new Date().toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        const rentCollected = payments
          .filter(
            (p: Payment) => p.month === currentMonth && p.status === "Paid"
          )
          .reduce((sum: number, payment: Payment) => sum + payment.amount, 0);

        setStats({
          totalUsers: activeUsers,
          totalRooms: rooms.length,
          occupiedRooms,
          availableRooms,
          pendingComplaints: pendingComplaintsCount,
          rentCollected,
        });
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 dark:from-pink-400 dark:to-purple-500">
            Admin Dashboard
          </h1>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="relative">
              <button className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-200">
                <FiCalendar className="h-4 w-4" />
                <span>
                  {new Date().toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users Card */}
          <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6 transition-all duration-300 hover:shadow-pink-200/20 dark:hover:shadow-pink-900/20 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Users
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalUsers}
                </h3>
                <Link
                  href="/admin/users"
                  className="inline-flex items-center mt-3 text-sm font-medium text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors duration-200"
                >
                  View all users
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
              <div className="bg-pink-100 dark:bg-pink-900/30 p-3 rounded-lg">
                <FiUsers className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
          </div>

          {/* Rooms Stats Card */}
          <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6 transition-all duration-300 hover:shadow-blue-200/20 dark:hover:shadow-blue-900/20 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Room Status
                </p>
                <div className="flex items-end gap-2 mt-1">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalRooms}
                  </h3>
                  <p className="text-xs font-medium mb-1">
                    <span className="text-green-600 dark:text-green-400">
                      {stats.occupiedRooms} occupied
                    </span>{" "}
                    |
                    <span className="text-blue-600 dark:text-blue-400">
                      {" "}
                      {stats.availableRooms} available
                    </span>
                  </p>
                </div>
                <Link
                  href="/admin/rooms"
                  className="inline-flex items-center mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200"
                >
                  Manage rooms
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <FiHome className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Rent Collected Card */}
          <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6 transition-all duration-300 hover:shadow-green-200/20 dark:hover:shadow-green-900/20 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Rent Collected
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  ₹{stats.rentCollected.toLocaleString()}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Current month
                </p>
                <Link
                  href="/admin/payments"
                  className="inline-flex items-center mt-2 text-sm font-medium text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-200"
                >
                  View payments
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <FiDollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Pending Complaints Card */}
          <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6 transition-all duration-300 hover:shadow-amber-200/20 dark:hover:shadow-amber-900/20 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pending Complaints
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.pendingComplaints}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Needs attention
                </p>
                <Link
                  href="/admin/complaints"
                  className="inline-flex items-center mt-2 text-sm font-medium text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors duration-200"
                >
                  View complaints
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg">
                <FiAlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Room Occupancy Chart */}
          <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Room Occupancy
            </h2>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Occupied", value: stats.occupiedRooms },
                      { name: "Available", value: stats.availableRooms },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    <Cell fill="#4F46E5" />
                    <Cell fill="#10B981" />
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} rooms`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dummy Revenue Trend Chart */}
          <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Revenue Trend
            </h2>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { name: "Jan", revenue: 150000 },
                    { name: "Feb", revenue: 160000 },
                    { name: "Mar", revenue: 170000 },
                    { name: "Apr", revenue: 180000 },
                    { name: "May", revenue: 190000 },
                    { name: "Jun", revenue: stats.rentCollected },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    formatter={(value) => [`₹${value.toLocaleString()}`]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#D946EF"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/users/register">
              <div className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-all duration-300 shadow-lg hover:shadow-pink-200/40 dark:hover:shadow-pink-900/40">
                <FiUsers className="h-5 w-5 mx-auto mb-1" />
                Register User
              </div>
            </Link>
            <Link href="/admin/rooms/create">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-all duration-300 shadow-lg hover:shadow-blue-200/40 dark:hover:shadow-blue-900/40">
                <FiHome className="h-5 w-5 mx-auto mb-1" />
                Add Room
              </div>
            </Link>
            <Link href="/admin/payments/create">
              <div className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-all duration-300 shadow-lg hover:shadow-green-200/40 dark:hover:shadow-green-900/40">
                <FiDollarSign className="h-5 w-5 mx-auto mb-1" />
                Record Payment
              </div>
            </Link>
            <Link href="/admin/notices/create">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-all duration-300 shadow-lg hover:shadow-purple-200/40 dark:hover:shadow-purple-900/40">
                <FiTrendingUp className="h-5 w-5 mx-auto mb-1" />
                Create Notice
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Data Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Recent Users
            </h2>
            {recentUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        PG ID
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentUsers.map((user) => (
                      <tr key={user._id}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {user.name}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {user.pgId}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {user.isActive ? (
                            <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded text-xs">
                              Active
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded text-xs">
                              Inactive
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No users found</p>
            )}
            <Link
              href="/admin/users"
              className="text-sm text-blue-600 dark:text-blue-400 mt-4 inline-block"
            >
              View all users →
            </Link>
          </div>

          {/* Recent Payments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Recent Payments
            </h2>
            {recentPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Month
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentPayments.map((payment) => (
                      <tr key={payment._id}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {payment.userId.name}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ₹{payment.amount}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {payment.month}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No payments found
              </p>
            )}
            <Link
              href="/admin/payments"
              className="text-sm text-blue-600 dark:text-blue-400 mt-4 inline-block"
            >
              View all payments →
            </Link>
          </div>

          {/* Pending Complaints */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Pending Complaints
            </h2>
            {pendingComplaints.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {pendingComplaints.map((complaint) => (
                      <tr key={complaint._id}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {complaint.userId.name}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {complaint.title}
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
                No pending complaints
              </p>
            )}
            <Link
              href="/admin/complaints"
              className="text-sm text-blue-600 dark:text-blue-400 mt-4 inline-block"
            >
              View all complaints →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
