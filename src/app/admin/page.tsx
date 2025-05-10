"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  FiUsers,
  FiHome,
  FiAlertCircle,
  FiCalendar,
  FiRefreshCw,
  FiBell,
  FiChevronsUp,
  FiTrendingUp,
  FiTrendingDown,
  FiInfo,
  FiMessageSquare,
  FiCheckCircle,
  FiMonitor,
  FiClipboard,
  FiSettings,
  FiDollarSign,
} from "react-icons/fi";
import {
  RiWechatLine,
  RiUserLocationLine,
  RiLineChartLine,
  RiPieChartLine,
  RiBarChartLine,
  RiCurrencyLine,
} from "react-icons/ri";
import { Inter } from "next/font/google";
import NoticeUsersList from "@/components/admin/NoticeUsersList";

const inter = Inter({ subsets: ["latin"] });

interface DashboardStats {
  totalUsers: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  pendingComplaints: number;
  rentCollected: number;
  usersWithDues: number;
  occupancyRate: number;
  previousMonthRent?: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  pgId: string;
  role: string;
  isActive: boolean;
  joinDate?: string;
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
  paymentStatus: string;
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
  description?: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
}

interface UserWithDues extends User {
  amount?: number;
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
    usersWithDues: 0,
    occupancyRate: 0,
    previousMonthRent: 0,
  });

  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [pendingComplaints, setPendingComplaints] = useState<Complaint[]>([]);
  const [revenueData, setRevenueData] = useState<
    { name: string; revenue: number }[]
  >([]);
  const [refreshing, setRefreshing] = useState(false);
  const [usersWithDues, setUsersWithDues] = useState<UserWithDues[]>([]);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<Room[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);

  // Function to refresh dashboard data
  const refreshDashboard = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Use Promise.all to fetch data concurrently
      const [
        usersResponse,
        roomsResponse,
        paymentsResponse,
        complaintsResponse,
      ] = await Promise.all([
        axios.get("/api/users?onlyActiveConfirmed=true"),
        axios.get("/api/rooms"),
        axios.get("/api/payments"),
        axios.get("/api/complaints"),
      ]);

      // Extract data
      const users = usersResponse.data.users || [];
      const rooms = roomsResponse.data.rooms || [];
      const payments = paymentsResponse.data.payments || [];
      const allComplaints = complaintsResponse.data.complaints || [];

      // Store complete data sets
      setAllUsers(users);
      setRoomData(rooms);
      setAllPayments(payments);
      setAllComplaints(allComplaints);

      // Set recent data
      setRecentUsers(users.slice(0, 5));
      setRecentPayments(payments.slice(0, 5));

      // Filter and set complaints
      const openComplaints = allComplaints.filter(
        (c: Complaint) => c.status === "Open"
      );
      setPendingComplaints(openComplaints.slice(0, 5));

      let usersWithDuesData: UserWithDues[] = [];

      // Fetch users with unpaid dues in a single API call
      const duesResponse = await axios.get("/api/payments/dues");
      if (duesResponse.data.success) {
        const userIdsWithDues = duesResponse.data.usersWithDues || [];

        // Get user details for each user with dues
        const usersWithDuesDetails = users.filter((user: User) =>
          userIdsWithDues.includes(user._id)
        );

        // Calculate total amount for each user with dues using the payments already fetched
        usersWithDuesData = usersWithDuesDetails.map((user: User) => {
          const userDuePayments = payments.filter(
            (p: Payment) =>
              p.userId._id === user._id &&
              (p.paymentStatus === "Due" || p.paymentStatus === "Overdue")
          );

          const totalDueAmount = userDuePayments.reduce(
            (sum: number, payment: Payment) => sum + payment.amount,
            0
          );

          return {
            ...user,
            amount: totalDueAmount,
          };
        });

        setUsersWithDues(usersWithDuesData.slice(0, 5));
      }

      // Calculate dashboard stats
      const totalUsers = users.length; // Active and confirmed users count
      const occupiedRoomsCount = rooms.filter(
        (r: Room) => r.status === "occupied"
      ).length;
      const availableRoomsCount = rooms.filter(
        (r: Room) => r.status === "available"
      ).length;
      const pendingComplaintsCount = openComplaints.length;
      const occupancyRate =
        rooms.length > 0
          ? Math.round((occupiedRoomsCount / rooms.length) * 100)
          : 0;

      // Calculate rent collected this month
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      // Get previous month
      const prevDate = new Date(currentDate);
      prevDate.setMonth(currentDate.getMonth() - 1);
      const previousMonth = prevDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      const currentMonthPayments = payments.filter(
        (p: Payment) => p.month === currentMonth && p.paymentStatus === "Paid"
      );

      const previousMonthPayments = payments.filter(
        (p: Payment) => p.month === previousMonth && p.paymentStatus === "Paid"
      );

      const currentRentCollected = currentMonthPayments.reduce(
        (sum: number, payment: Payment) => sum + payment.amount,
        0
      );

      const previousRentCollected = previousMonthPayments.reduce(
        (sum: number, payment: Payment) => sum + payment.amount,
        0
      );

      setStats({
        totalUsers: totalUsers,
        totalRooms: rooms.length,
        occupiedRooms: occupiedRoomsCount,
        availableRooms: availableRoomsCount,
        pendingComplaints: pendingComplaintsCount,
        rentCollected: currentRentCollected,
        usersWithDues: usersWithDuesData.length,
        occupancyRate,
        previousMonthRent: previousRentCollected,
      });

      // Generate revenue data for the last 6 months
      const revenueByMonth = generateRevenueData(payments);
      setRevenueData(revenueByMonth);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      setLoading(false);
    }
  };

  // Generate revenue data for the last 6 months
  const generateRevenueData = (payments: Payment[]) => {
    const data = [];
    const today = new Date();

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = date.toLocaleString("default", { month: "short" });
      const monthYear = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      // Calculate revenue for this month
      const monthlyRevenue = payments
        .filter(
          (p: Payment) => p.month === monthYear && p.paymentStatus === "Paid"
        )
        .reduce((sum: number, payment: Payment) => sum + payment.amount, 0);

      data.push({
        name: monthName,
        revenue: monthlyRevenue,
      });
    }

    return data;
  };

  // Function to send payment reminder
  const handleSendReminder = async (userId: string) => {
    try {
      setSendingReminder(userId);
      const response = await axios.post(
        `/api/payments/send-reminder/${userId}`
      );

      if (response.data.success) {
        alert("Payment reminder sent successfully!");
      } else {
        alert(response.data.message || "Failed to send reminder");
      }
    } catch (err) {
      console.error("Error sending payment reminder:", err);
      alert("Failed to send payment reminder. Please try again.");
    } finally {
      setSendingReminder(null);
    }
  };

  // Calculate room type distribution for donut chart
  const roomTypeDistribution = useMemo(() => {
    if (!roomData.length) return [];

    const typeCounts: Record<string, number> = {};
    roomData.forEach((room) => {
      if (!typeCounts[room.type]) {
        typeCounts[room.type] = 0;
      }
      typeCounts[room.type]++;
    });

    return Object.keys(typeCounts).map((type) => ({
      name: type,
      value: typeCounts[type],
    }));
  }, [roomData]);

  // Calculate rent growth rate
  const rentGrowthRate = useMemo(() => {
    if (!stats.previousMonthRent || stats.previousMonthRent === 0) return 0;
    return Math.round(
      ((stats.rentCollected - stats.previousMonthRent) /
        stats.previousMonthRent) *
        100
    );
  }, [stats.rentCollected, stats.previousMonthRent]);

  useEffect(() => {
    fetchDashboardData();
    // Add a refresh interval every 5 minutes
    const interval = setInterval(
      () => {
        fetchDashboardData();
      },
      5 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md dark:bg-red-900/60 dark:text-red-200 dark:border-red-700"
          role="alert"
        >
          <div className="flex items-center">
            <FiAlertCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Error:</span>
            <span className="ml-2">{error}</span>
          </div>
          <button
            onClick={refreshDashboard}
            className="mt-3 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Chart colors
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#e57373",
  ];

  return (
    <div className="max-[1600px] mx-auto px-4 py-6">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
            <p className="mt-2 text-purple-100">
              Welcome back! Here's what's happening today
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={refreshDashboard}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-white text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition-all duration-200 disabled:opacity-70"
            >
              {refreshing ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-purple-700 border-t-transparent rounded-full"></div>
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <FiRefreshCw className="h-4 w-4 mr-2" />
                  <span>Refresh</span>
                </>
              )}
            </button>
            <div className="flex items-center bg-purple-500/30 px-4 py-2 rounded-lg">
              <FiCalendar className="h-4 w-4 mr-2" />
              <span>
                {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Stats Cards */}
        <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Users Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Confirmed Users
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalUsers}
                </h3>
                <div className="flex items-center mt-2">
                  <FiUsers className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-1" />
                  <Link
                    href="/admin/users"
                    className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    View all users
                  </Link>
                </div>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <FiUsers className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          {/* Rooms Stats Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Room Occupancy
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.occupancyRate}%
                </h3>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                    {stats.occupiedRooms}/{stats.totalRooms} rooms
                  </span>
                  <Link
                    href="/admin/rooms"
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Manage
                  </Link>
                </div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <FiHome className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-2 bg-blue-600 dark:bg-blue-500 rounded-full"
                style={{ width: `${stats.occupancyRate}%` }}
              ></div>
            </div>
          </div>

          {/* Rent Collected Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Rent Collected
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  ₹{stats.rentCollected.toLocaleString("en-IN")}
                </h3>
                <div className="flex items-center mt-2">
                  <span
                    className={`inline-flex items-center text-xs ${rentGrowthRate >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {rentGrowthRate >= 0 ? (
                      <FiTrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <FiTrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(rentGrowthRate)}% vs last month
                  </span>
                </div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <FiDollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Pending Complaints Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pending Complaints
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.pendingComplaints}
                </h3>
                <div className="flex items-center mt-2">
                  <FiAlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-1" />
                  <Link
                    href="/admin/complaints"
                    className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    View complaints
                  </Link>
                </div>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                <FiMessageSquare className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          {/* Unpaid Dues Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Users With Dues
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.usersWithDues}
                </h3>
                <div className="flex items-center mt-2">
                  <FiBell className="h-4 w-4 text-red-600 dark:text-red-400 mr-1" />
                  <Link
                    href="/admin/payments"
                    className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
                  >
                    Manage dues
                  </Link>
                </div>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                <FiBell className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          {/* Available Rooms Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Available Rooms
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.availableRooms}
                </h3>
                <div className="flex items-center mt-2">
                  <FiCheckCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-1" />
                  <Link
                    href="/admin/rooms"
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View rooms
                  </Link>
                </div>
              </div>
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
                <RiUserLocationLine className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <RiLineChartLine className="h-5 w-5 text-pink-600 mr-2" />
              Revenue Trend
            </h2>
            <span className="text-xs px-2 py-1 bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 rounded-full">
              Last 6 months
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickMargin={10}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickFormatter={(value) =>
                    `₹${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`
                  }
                />
                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString("en-IN")}`,
                    "Revenue",
                  ]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue (₹)"
                  stroke="#d946ef"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, stroke: "#d946ef", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second row: Room distribution and tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Room Type Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <RiPieChartLine className="h-5 w-5 text-blue-600 mr-2" />
              Room Distribution
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roomTypeDistribution}
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
                  {roomTypeDistribution.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} rooms`, name]}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  formatter={(value) => (
                    <span className="text-xs">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Occupancy Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <RiBarChartLine className="h-5 w-5 text-green-600 mr-2" />
              Room Occupancy
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: "Occupied",
                    value: stats.occupiedRooms,
                    fill: "#10b981",
                  },
                  {
                    name: "Available",
                    value: stats.availableRooms,
                    fill: "#3b82f6",
                  },
                ]}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  formatter={(value, name) => [`${value} rooms`, name]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <FiSettings className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
              Quick Actions
            </h2>
          </div>
          <div className="space-y-4">
            <Link
              href="/admin/rooms"
              className="flex items-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-700 dark:text-blue-300"
            >
              <div className="h-10 w-10 flex items-center justify-center bg-blue-200 dark:bg-blue-800 rounded-full mr-3">
                <FiHome className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              </div>
              <div>
                <h3 className="font-medium">Manage Rooms</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Update room status and details
                </p>
              </div>
            </Link>

            <Link
              href="/admin/payments/create"
              className="flex items-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-green-700 dark:text-green-300"
            >
              <div className="h-10 w-10 flex items-center justify-center bg-green-200 dark:bg-green-800 rounded-full mr-3">
                <FiDollarSign className="h-5 w-5 text-green-700 dark:text-green-300" />
              </div>
              <div>
                <h3 className="font-medium">Record Payment</h3>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Add a new payment record
                </p>
              </div>
            </Link>

            <Link
              href="/admin/complaints"
              className="flex items-center p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-amber-700 dark:text-amber-300"
            >
              <div className="h-10 w-10 flex items-center justify-center bg-amber-200 dark:bg-amber-800 rounded-full mr-3">
                <FiAlertCircle className="h-5 w-5 text-amber-700 dark:text-amber-300" />
              </div>
              <div>
                <h3 className="font-medium">Handle Complaints</h3>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Resolve pending issues
                </p>
              </div>
            </Link>

            <Link
              href="/admin/notices"
              className="flex items-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-700 dark:text-blue-300"
            >
              <div className="h-10 w-10 flex items-center justify-center bg-blue-200 dark:bg-blue-800 rounded-full mr-3">
                <FiBell className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              </div>
              <div>
                <h3 className="font-medium">Manage Notices</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Create & manage announcements
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Users on Notice Period Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Users on Notice Period
        </h2>
        <NoticeUsersList />
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <FiUsers className="h-5 w-5 text-purple-600 mr-2" />
              Recent Users
            </h2>
            <Link
              href="/admin/users"
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium flex items-center"
            >
              View all
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          {recentUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      PG ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {recentUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-3">
                            {user.name
                              ? user.name.charAt(0).toUpperCase()
                              : "?"}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name || "Unknown User"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {user.pgId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/users/${user._id}`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No users found</p>
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <FiDollarSign className="h-5 w-5 text-green-600 mr-2" />
              Recent Payments
            </h2>
            <Link
              href="/admin/payments"
              className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium flex items-center"
            >
              View all
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          {recentPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {recentPayments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {payment.userId?.name || "Unknown User"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {payment.userId?.pgId || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ₹{payment.amount.toLocaleString("en-IN")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {payment.month}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {payment.paymentDate &&
                            new Date(payment.paymentDate).toLocaleDateString(
                              "en-IN"
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            payment.paymentStatus === "Paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : payment.paymentStatus === "Due"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {payment.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No payments found
              </p>
            </div>
          )}
        </div>

        {/* Pending Complaints */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <FiAlertCircle className="h-5 w-5 text-amber-600 mr-2" />
              Pending Complaints
            </h2>
            <Link
              href="/admin/complaints"
              className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-medium flex items-center"
            >
              View all
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          {pendingComplaints.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Issue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {pendingComplaints.map((complaint) => (
                    <tr
                      key={complaint._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {complaint.userId?.name || "Unknown User"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {complaint.userId?.pgId || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {complaint.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(complaint.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/complaints?id=${complaint._id}`}
                          className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                        >
                          Resolve
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No pending complaints
              </p>
            </div>
          )}
        </div>

        {/* Users with Unpaid Dues */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <FiBell className="h-5 w-5 text-red-600 mr-2" />
              Unpaid Dues
            </h2>
            <Link
              href="/admin/payments"
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium flex items-center"
            >
              View all
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          {usersWithDues.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount Due
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {usersWithDues.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mr-3">
                            {user.name
                              ? user.name.charAt(0).toUpperCase()
                              : "?"}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name || "Unknown User"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-red-600 dark:text-red-400">
                          ₹{user.amount?.toLocaleString("en-IN") || "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleSendReminder(user._id)}
                          disabled={sendingReminder === user._id}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/50 transition-colors disabled:opacity-50"
                        >
                          {sendingReminder === user._id ? (
                            <>
                              <div className="animate-spin h-3 w-3 mr-1.5 border border-red-700 border-t-transparent rounded-full"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <FiBell className="h-3.5 w-3.5 mr-1.5" />
                              Send Reminder
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No users with unpaid dues
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
