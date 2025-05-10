"use client";

import React, { useState, useEffect, use } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  UserCheck,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building,
  Star,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
import Loader from "@/components/Loader";

interface ExitFeedback {
  overallExperience: number;
  cleanliness: number;
  facilities: number;
  staff: number;
  foodQuality: number;
  valueForMoney: number;
  wouldRecommend: boolean;
  likedMost: string;
  improvements: string;
  exitReason: string;
  otherComments: string;
}

interface UserArchive {
  _id: string;
  name: string;
  email: string;
  phone: string;
  pgId: string;
  fathersName: string;
  city: string;
  state: string;
  permanentAddress: string;
  moveInDate: string;
  moveOutDate: string;
  archiveDate: string;
  archiveReason: string;
  stayDuration: number;
  exitSurveyCompleted: boolean;
  exitFeedback?: ExitFeedback;
  profileImage?: string;
}

interface Room {
  _id: string;
  roomNumber: string;
  floor: string;
  capacity: number;
  currentOccupancy: number;
  roomType: string;
  bedType: string;
  price: number;
}

export default function UserArchiveDetail({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  // Properly unwrap the params object using React.use()
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const userId = resolvedParams.id;

  const router = useRouter();
  const [archive, setArchive] = useState<UserArchive | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activating, setActivating] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [showReactivateModal, setShowReactivateModal] = useState(false);

  // New states for payment details
  const [collectDeposit, setCollectDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const [collectRent, setCollectRent] = useState(false);
  const [rentAmount, setRentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [transactionId, setTransactionId] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  useEffect(() => {
    fetchArchiveDetails();
    fetchAvailableRooms();
  }, [userId]);

  const fetchArchiveDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/user-archives/${userId}`);

      if (response.data.success) {
        setArchive(response.data.archive);
      } else {
        setError("Failed to load user archive details");
      }
    } catch (err) {
      console.error("Error fetching archive details:", err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const response = await axios.get("/api/rooms?hasSpace=true");
      if (response.data.success) {
        setRooms(response.data.rooms);
      }
    } catch (err) {
      console.error("Error fetching available rooms:", err);
    }
  };

  const handleReactivateUser = async () => {
    if (!selectedRoom) {
      toast.error("Please select a room for the user");
      return;
    }

    try {
      setActivating(true);
      const response = await axios.put(`/api/users/inactive`, {
        userId: userId,
        roomId: selectedRoom,
        checkInDate: new Date(),
        // Add the payment details to match registration approval process
        collectDeposit,
        depositAmount: collectDeposit ? depositAmount : 0,
        collectRent,
        rentAmount: collectRent ? rentAmount : 0,
        selectedMonths,
        paymentMethod,
        transactionId,
        paymentRemarks,
      });

      if (response.data.success) {
        toast.success("User reactivated successfully");
        router.push("/admin/users");
      } else {
        toast.error(response.data.message || "Failed to reactivate user");
      }
    } catch (err: any) {
      console.error("Error reactivating user:", err);
      toast.error(err.response?.data?.message || "Failed to reactivate user");
    } finally {
      setActivating(false);
      setShowReactivateModal(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to generate months list
  const generateMonthsList = () => {
    const months = [];
    const currentDate = new Date();

    for (let i = 0; i < 3; i++) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() + i);
      months.push(
        date.toLocaleString("default", { month: "long", year: "numeric" })
      );
    }

    return months;
  };

  // Available months for rent payment
  const availableMonths = generateMonthsList();

  // Toggle month selection
  const toggleMonth = (month: string) => {
    if (selectedMonths.includes(month)) {
      setSelectedMonths(selectedMonths.filter((m) => m !== month));
    } else {
      setSelectedMonths([...selectedMonths, month]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error || !archive) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 bg-red-100 text-red-600 rounded-md">
          {error || "User archive not found"}
        </div>
        <div className="mt-4">
          <button
            onClick={() => router.back()}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
          >
            <ArrowLeft size={16} className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {archive.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Archive ID: {archive._id}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowReactivateModal(true)}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          <UserCheck size={16} className="mr-2" />
          Reactivate User
        </button>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User details card */}
        <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              {archive.profileImage ? (
                <img
                  src={archive.profileImage}
                  alt={archive.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                  {archive.name.charAt(0)}
                </div>
              )}
            </div>

            <h2 className="text-xl font-semibold text-center mb-6">
              Personal Information
            </h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                <span className="text-gray-900 dark:text-white">
                  {archive.email}
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                <span className="text-gray-900 dark:text-white">
                  {archive.phone}
                </span>
              </div>
              {archive.fathersName && (
                <div className="flex items-start">
                  <UserCheck className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Father's Name
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {archive.fathersName}
                    </p>
                  </div>
                </div>
              )}
              {archive.permanentAddress && (
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Permanent Address
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {archive.permanentAddress}
                      {archive.city && archive.state && (
                        <>
                          , {archive.city}, {archive.state}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              )}
              {archive.pgId && (
                <div className="flex items-start">
                  <Building className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      PG ID
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {archive.pgId}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stay details card */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Stay Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Check-in Date
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(archive.moveInDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Check-out Date
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(archive.moveOutDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Archive Date
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(archive.archiveDate)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Duration of Stay
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {archive.stayDuration} days (
                      {Math.floor(archive.stayDuration / 30)} months,{" "}
                      {archive.stayDuration % 30} days)
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Archive Reason
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          archive.archiveReason === "Completed Stay"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : archive.archiveReason === "Rule Violation"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {archive.archiveReason}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Exit survey details */}
            {archive.exitSurveyCompleted && archive.exitFeedback ? (
              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Exit Survey Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Ratings
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          name: "Overall Experience",
                          value: archive.exitFeedback.overallExperience,
                        },
                        {
                          name: "Cleanliness",
                          value: archive.exitFeedback.cleanliness,
                        },
                        {
                          name: "Facilities",
                          value: archive.exitFeedback.facilities,
                        },
                        { name: "Staff", value: archive.exitFeedback.staff },
                        {
                          name: "Food Quality",
                          value: archive.exitFeedback.foodQuality,
                        },
                        {
                          name: "Value For Money",
                          value: archive.exitFeedback.valueForMoney,
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="text-gray-700 dark:text-gray-300">
                            {item.name}
                          </span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div key={star} className="w-4 h-4 ml-1">
                                {star <= item.value ? (
                                  <svg
                                    fill="currentColor"
                                    className="text-yellow-400"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ) : (
                                  <svg
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="text-gray-300 dark:text-gray-600"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="pt-3 border-t border-gray-200 dark:border-gray-600 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300">
                            Would Recommend
                          </span>
                          <div className="flex items-center">
                            {archive.exitFeedback.wouldRecommend ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <X className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {archive.exitFeedback.exitReason && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          Reason for Leaving
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          {archive.exitFeedback.exitReason}
                        </p>
                      </div>
                    )}

                    {archive.exitFeedback.likedMost && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          What They Liked Most
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          {archive.exitFeedback.likedMost}
                        </p>
                      </div>
                    )}

                    {archive.exitFeedback.improvements && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          Suggested Improvements
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          {archive.exitFeedback.improvements}
                        </p>
                      </div>
                    )}

                    {archive.exitFeedback.otherComments && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          Additional Comments
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          {archive.exitFeedback.otherComments}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 text-center">
                  No exit survey data available for this user.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reactivate user modal */}
      {showReactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Reactivate User - {archive.name}
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleReactivateUser();
              }}
              className="space-y-6"
            >
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Provide room assignment and payment details to reactivate this
                  user. Fields marked with * are required.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Room Assignment Section */}
                <div className="md:col-span-2">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">
                    Room Assignment
                  </h4>
                  <div>
                    <label
                      htmlFor="room"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Room *
                    </label>
                    <select
                      id="room"
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                    >
                      <option value="">Select a room</option>
                      {rooms.map((room) => (
                        <option key={room._id} value={room._id}>
                          Room {room.roomNumber} - {room.roomType} (
                          {room.currentOccupancy}/{room.capacity} occupied) - ₹
                          {room.price}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Security Deposit Section */}
                <div className="md:col-span-2">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">
                    Security Deposit
                  </h4>
                  <div className="flex items-center mb-2">
                    <input
                      id="collectDeposit"
                      name="collectDeposit"
                      type="checkbox"
                      checked={collectDeposit}
                      onChange={(e) => setCollectDeposit(e.target.checked)}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="collectDeposit"
                      className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Collect Security Deposit
                    </label>
                  </div>

                  {collectDeposit && (
                    <div className="mt-2">
                      <label
                        htmlFor="depositAmount"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Deposit Amount (₹) *
                      </label>
                      <input
                        type="number"
                        name="depositAmount"
                        id="depositAmount"
                        value={depositAmount}
                        onChange={(e) =>
                          setDepositAmount(parseInt(e.target.value) || 0)
                        }
                        required={collectDeposit}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>

                {/* Rent Collection Section */}
                <div className="md:col-span-2">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">
                    Payment Details
                  </h4>
                  <div className="flex items-center mb-2">
                    <input
                      id="collectRent"
                      name="collectRent"
                      type="checkbox"
                      checked={collectRent}
                      onChange={(e) => setCollectRent(e.target.checked)}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="collectRent"
                      className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Collect Rent Payment
                    </label>
                  </div>

                  {collectRent && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label
                            htmlFor="rentAmount"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Rent Amount (₹) *
                          </label>
                          <input
                            type="number"
                            name="rentAmount"
                            id="rentAmount"
                            value={rentAmount}
                            onChange={(e) =>
                              setRentAmount(parseInt(e.target.value) || 0)
                            }
                            required={collectRent}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="paymentMethod"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Payment Method *
                          </label>
                          <select
                            id="paymentMethod"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            required={collectRent}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                          >
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Debit Card">Debit Card</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      {paymentMethod !== "Cash" && (
                        <div className="mt-4">
                          <label
                            htmlFor="transactionId"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Transaction ID
                          </label>
                          <input
                            type="text"
                            name="transactionId"
                            id="transactionId"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                          />
                        </div>
                      )}

                      <div className="mt-4">
                        <label
                          htmlFor="paymentRemarks"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Payment Remarks
                        </label>
                        <textarea
                          id="paymentRemarks"
                          name="paymentRemarks"
                          value={paymentRemarks}
                          onChange={(e) => setPaymentRemarks(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                          placeholder="Optional payment notes"
                        ></textarea>
                      </div>
                    </>
                  )}
                </div>

                {/* Month Selection */}
                {collectRent && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Months *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 border border-gray-300 dark:border-gray-700 rounded-md max-h-60 overflow-y-auto">
                      {availableMonths.map((month, index) => (
                        <label
                          key={index}
                          className="flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            value={month}
                            checked={selectedMonths.includes(month)}
                            onChange={() => toggleMonth(month)}
                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-700"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {month}
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Select the months for which payment is being made
                    </p>
                    {selectedMonths.length > 0 && (
                      <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Selected: {selectedMonths.join(", ")}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowReactivateModal(false)}
                  disabled={activating}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    activating ||
                    !selectedRoom ||
                    (collectRent && selectedMonths.length === 0) ||
                    (collectRent && !rentAmount) ||
                    (collectDeposit && !depositAmount)
                  }
                  className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {activating ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Reactivate User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
