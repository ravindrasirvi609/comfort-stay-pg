"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

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
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Admin Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Total Users
          </h2>
          <p className="text-3xl font-bold text-pink-600">{stats.totalUsers}</p>
          <Link
            href="/admin/users"
            className="text-sm text-blue-600 dark:text-blue-400 mt-2 inline-block"
          >
            View all users →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Room Status
          </h2>
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-pink-600">
                {stats.totalRooms}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Occupied
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.occupiedRooms}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Available
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.availableRooms}
              </p>
            </div>
          </div>
          <Link
            href="/admin/rooms"
            className="text-sm text-blue-600 dark:text-blue-400 mt-2 inline-block"
          >
            Manage rooms →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Rent Collected
          </h2>
          <p className="text-3xl font-bold text-pink-600">
            ₹{stats.rentCollected.toLocaleString()}
          </p>
          <Link
            href="/admin/payments"
            className="text-sm text-blue-600 dark:text-blue-400 mt-2 inline-block"
          >
            View payments →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Pending Complaints
          </h2>
          <p className="text-3xl font-bold text-pink-600">
            {stats.pendingComplaints}
          </p>
          <Link
            href="/admin/complaints"
            className="text-sm text-blue-600 dark:text-blue-400 mt-2 inline-block"
          >
            View complaints →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/users/register">
            <div className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded text-center">
              Register User
            </div>
          </Link>
          <Link href="/admin/rooms/create">
            <div className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center">
              Add Room
            </div>
          </Link>
          <Link href="/admin/payments/create">
            <div className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center">
              Record Payment
            </div>
          </Link>
          <Link href="/admin/notices/create">
            <div className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-center">
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
  );
}
