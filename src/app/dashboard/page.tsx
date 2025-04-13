"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaCalendarAlt,
  FaDoorOpen,
  FaBed,
  FaRupeeSign,
  FaBell,
  FaExclamationCircle,
  FaFileInvoiceDollar,
  FaChevronRight,
} from "react-icons/fa";
import { BiSolidMessageSquareDetail } from "react-icons/bi";
import Image from "next/image";

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
    bedNumber?: number;
  } | null;
  moveInDate: string;
  bedNumber?: number;
  gender?: string;
  emergencyContact?: string;
  address?: string;
  idProof?: string;
  profilePhoto?: string;
  allocatedRoomNo?: string;
}

interface Payment {
  _id: string;
  amount: number;
  month: string;
  status: string;
  paymentDate: string;
  receiptNumber: string;
  dueDate?: string;
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

export default function UserProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [roomDetails, setRoomDetails] = useState<{
    _id: string;
    roomNumber: string;
    type: string;
    price: number;
  } | null>(null);

  useEffect(() => {
    // Fetch dashboard data
    const fetchProfileData = async () => {
      try {
        setLoading(true);

        // Fetch current user
        const userResponse = await axios.get("/api/auth/me");
        if (userResponse.data.success) {
          const userData = userResponse.data.user;
          setUser(userData);

          // Fetch room details if roomId exists
          if (userData.roomId) {
            try {
              const roomResponse = await axios.get(
                `/api/rooms/${userData.roomId}`
              );
              if (roomResponse.data.success) {
                setRoomDetails({
                  _id: roomResponse.data.room._id,
                  roomNumber: roomResponse.data.room.roomNumber,
                  type: roomResponse.data.room.type,
                  price: roomResponse.data.room.price,
                });
              }
            } catch (err) {
              console.error("Error fetching room details:", err);
            }
          }
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
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data");
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-8 max-w-md mx-auto">
          <div className="flex flex-col items-center">
            <FaExclamationCircle className="text-red-500 text-5xl mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Unable to load profile
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
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
      {/* Profile Header Section */}
      <div className="backdrop-blur-lg bg-gradient-to-r from-pink-500/10 to-purple-600/10 dark:from-pink-500/5 dark:to-purple-600/5 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center">
          {/* Profile Image */}
          <div className="mb-4 md:mb-0 md:mr-8">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800">
              {user?.profilePhoto ? (
                <Image
                  src={user.profilePhoto}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                  width={100}
                  height={100}
                />
              ) : (
                <FaUser className="text-white text-4xl md:text-5xl" />
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 dark:from-pink-400 dark:to-purple-500">
              {user?.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <FaIdCard className="mr-2" />
                <span>{user?.pgId}</span>
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <FaDoorOpen className="mr-2" />
                <span>
                  Room{" "}
                  {user?.roomId?.roomNumber ||
                    user?.allocatedRoomNo ||
                    "Not Assigned"}
                </span>
              </div>
              {user?.bedNumber && (
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <FaBed className="mr-2" />
                  <span>Bed #{user.bedNumber}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
          </div>

          {/* Payment Status Card */}
          <div className="mt-6 md:mt-0 md:ml-4">
            <div
              className={`rounded-xl p-4 ${currentMonthPayment ? "bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-900/50" : "bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50"}`}
            >
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {currentMonth} Rent
              </h3>
              <p
                className={`text-xl font-bold ${currentMonthPayment ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
              >
                {currentMonthPayment ? "Paid" : "Due"}
              </p>
              <p className="text-sm mt-1">
                {currentMonthPayment
                  ? `Paid on ${new Date(currentMonthPayment.paymentDate).toLocaleDateString()}`
                  : roomDetails?.price
                    ? `₹${roomDetails.price} due`
                    : user?.roomId?.price
                      ? `₹${user.roomId.price} due`
                      : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto mb-8 backdrop-blur-md bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/30">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${activeTab === "overview" ? "text-pink-600 border-b-2 border-pink-600" : "text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-500"}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${activeTab === "payments" ? "text-pink-600 border-b-2 border-pink-600" : "text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-500"}`}
        >
          Payments
        </button>
        <button
          onClick={() => setActiveTab("complaints")}
          className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${activeTab === "complaints" ? "text-pink-600 border-b-2 border-pink-600" : "text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-500"}`}
        >
          Complaints
        </button>
        <button
          onClick={() => setActiveTab("notices")}
          className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${activeTab === "notices" ? "text-pink-600 border-b-2 border-pink-600" : "text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-500"}`}
        >
          Notices
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {activeTab === "overview" && (
          <>
            {/* Personal Information Card */}
            <div className="backdrop-blur-lg bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6 lg:col-span-1">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                <FaUser className="mr-3 text-pink-600" />
                Personal Information
              </h2>

              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Full Name
                  </h3>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user?.name}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <div className="flex items-center">
                      <FaEnvelope className="mr-2 text-gray-400" />
                      Email Address
                    </div>
                  </h3>
                  <p className="text-gray-900 dark:text-white">{user?.email}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <div className="flex items-center">
                      <FaPhone className="mr-2 text-gray-400" />
                      Phone Number
                    </div>
                  </h3>
                  <p className="text-gray-900 dark:text-white">{user?.phone}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <div className="flex items-center">
                      <FaIdCard className="mr-2 text-gray-400" />
                      PG ID
                    </div>
                  </h3>
                  <p className="text-gray-900 dark:text-white">{user?.pgId}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-400" />
                      Move-in Date
                    </div>
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(user?.moveInDate || "").toLocaleDateString(
                      "en-IN",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>

                {user?.gender && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Gender
                    </h3>
                    <p className="text-gray-900 dark:text-white">
                      {user.gender}
                    </p>
                  </div>
                )}

                {user?.emergencyContact && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Emergency Contact
                    </h3>
                    <p className="text-gray-900 dark:text-white">
                      {user.emergencyContact}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Room Information Card */}
            <div className="backdrop-blur-lg bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6 lg:col-span-1">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                <FaDoorOpen className="mr-3 text-pink-600" />
                Room Information
              </h2>

              {roomDetails ? (
                <div className="space-y-5">
                  <div className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 dark:from-pink-500/5 dark:to-purple-600/5 rounded-lg p-4 border border-pink-200 dark:border-pink-900/30 mb-6">
                    <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-1">
                      Room {roomDetails.roomNumber || "Not assigned"}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {roomDetails.type
                        ? `${roomDetails.type.charAt(0).toUpperCase() + roomDetails.type.slice(1)} Room`
                        : "Room"}
                      {user?.bedNumber ? ` • Bed #${user.bedNumber}` : ""}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Room Type
                    </h3>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {roomDetails.type || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      <div className="flex items-center">
                        <FaRupeeSign className="mr-2 text-gray-400" />
                        Monthly Rent
                      </div>
                    </h3>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {roomDetails.price
                        ? `₹${roomDetails.price.toLocaleString("en-IN")}`
                        : "₹"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      <div className="flex items-center">
                        <FaBed className="mr-2 text-gray-400" />
                        Bed Number
                      </div>
                    </h3>
                    <p className="text-gray-900 dark:text-white">
                      {user?.bedNumber || "Not assigned"}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href={`/dashboard/room/${roomDetails._id}`}
                      className="text-pink-600 hover:text-pink-700 dark:text-pink-500 dark:hover:text-pink-400 flex items-center"
                    >
                      View Room Details
                      <FaChevronRight className="ml-1 text-xs" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4 mb-4">
                    <p className="flex items-center text-yellow-800 dark:text-yellow-200">
                      <FaExclamationCircle className="mr-2" />
                      {user?.allocatedRoomNo
                        ? "Room details not available. Please contact admin."
                        : "No room assigned yet. Please contact the admin."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Room
                    </h3>
                    <p className="text-gray-900 dark:text-white">
                      {user?.allocatedRoomNo || "Not assigned"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Room Type
                    </h3>
                    <p className="text-gray-900 dark:text-white">
                      Not specified
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      <div className="flex items-center">
                        <FaRupeeSign className="mr-2 text-gray-400" />
                        Monthly Rent
                      </div>
                    </h3>
                    <p className="text-gray-900 dark:text-white font-medium">
                      ₹
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      <div className="flex items-center">
                        <FaBed className="mr-2 text-gray-400" />
                        Bed Number
                      </div>
                    </h3>
                    <p className="text-gray-900 dark:text-white">
                      {user?.bedNumber || "Not assigned"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "payments" && (
          <div className="lg:col-span-3">
            <div className="backdrop-blur-lg bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                  <FaFileInvoiceDollar className="mr-3 text-pink-600" />
                  Payment History
                </h2>
              </div>

              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Month
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Payment Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Receipt
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white/30 dark:bg-gray-800/30">
                      {payments.map((payment) => (
                        <tr
                          key={payment._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {payment.month}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            ₹{payment.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                payment.status === "Paid"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                  : payment.status === "Partial"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(payment.paymentDate).toLocaleDateString(
                              "en-IN",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <Link
                              href={`/dashboard/payments/${payment._id}`}
                              className="text-pink-600 hover:text-pink-700 dark:text-pink-500 dark:hover:text-pink-400 flex items-center"
                            >
                              View
                              <FaChevronRight className="ml-1 text-xs" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 dark:bg-gray-800 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaFileInvoiceDollar className="text-gray-400 dark:text-gray-500 text-3xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No payment records
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                    You don&apos;t have any payment records yet. Once you make
                    payments, they will appear here.
                  </p>
                  <Link
                    href="/dashboard/payments/new"
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    Make Your First Payment
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "complaints" && (
          <div className="lg:col-span-3">
            <div className="backdrop-blur-lg bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                  <BiSolidMessageSquareDetail className="mr-3 text-pink-600" />
                  My Complaints
                </h2>

                <Link
                  href="/dashboard/complaints/new"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  New Complaint
                </Link>
              </div>

              {complaints.length > 0 ? (
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <div
                      key={complaint._id}
                      className="bg-white/70 dark:bg-gray-800/70 rounded-lg border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="mb-3 md:mb-0">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {complaint.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {complaint.description}
                          </p>
                        </div>

                        <div className="flex flex-col md:items-end space-y-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                              complaint.status === "Open"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                                : complaint.status === "In Progress"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                            }`}
                          >
                            {complaint.status}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(complaint.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <Link
                          href={`/dashboard/complaints/${complaint._id}`}
                          className="text-pink-600 hover:text-pink-700 dark:text-pink-500 dark:hover:text-pink-400 text-sm font-medium flex items-center"
                        >
                          View Details
                          <FaChevronRight className="ml-1 text-xs" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 dark:bg-gray-800 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BiSolidMessageSquareDetail className="text-gray-400 dark:text-gray-500 text-3xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No complaints yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                    You haven&apos;t filed any complaints yet. If you encounter
                    any issues with your accommodation, please let us know.
                  </p>
                  <Link
                    href="/dashboard/complaints/new"
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    Report an Issue
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "notices" && (
          <div className="lg:col-span-3">
            <div className="backdrop-blur-lg bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center mb-6">
                <FaBell className="mr-3 text-pink-600" />
                Notices & Announcements
              </h2>

              {notices.length > 0 ? (
                <div className="space-y-6">
                  {notices.map((notice) => (
                    <div
                      key={notice._id}
                      className="bg-white/70 dark:bg-gray-800/70 rounded-lg border-l-4 border-pink-500 border-t border-r border-b border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {notice.title}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                          {new Date(notice.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mt-3 mb-3">
                        {notice.description}
                      </p>

                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        Posted by:{" "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {notice.createdBy.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 dark:bg-gray-800 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaBell className="text-gray-400 dark:text-gray-500 text-3xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No notices available
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    There are no notices or announcements at the moment. Check
                    back later for updates.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Rest of the component */}
    </div>
  );
}
