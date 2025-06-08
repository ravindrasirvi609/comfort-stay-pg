"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { FaSpinner } from "react-icons/fa";
import CustomSelect from "@/components/CustomSelect";

interface PendingRegistration {
  _id: string;
  name: string;
  email: string;
  fathersName: string;
  phone: string;
  guardianMobileNumber: string;
  permanentAddress: string;
  city: string;
  state: string;
  companyName: string;
  companyAddress: string;
  employeeId: string;
  validIdType: string;
  validIdPhoto: string;
  profileImage: string;
  registrationStatus: string;
  createdAt: string;
  checkInDate?: string;
  pgId?: string;
  roomId?:
    | {
        _id: string;
        roomNumber: string;
        type: string;
        currentOccupancy: number;
        capacity: number;
      }
    | string
    | null;
}

interface Room {
  _id: string;
  roomNumber: string;
  type: string;
  currentOccupancy: number;
  capacity: number;
  building?: string;
}

export default function PendingRegistrationDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [registration, setRegistration] = useState<PendingRegistration | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [rejectSuccess, setRejectSuccess] = useState(false);

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState({
    roomId: "",
    roomNumber: "",
    amount: "",
    months: [
      new Date().toLocaleString("default", { month: "long", year: "numeric" }),
    ],
    paymentMethod: "Cash",
    paymentStatus: "Paid",
    checkInDate: new Date().toISOString().split("T")[0],
    depositAmount: "",
    keyIssued: false,
  });

  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchRegistrationDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/pending-registrations/${id}`);

        if (response.data.success) {
          setRegistration(response.data.pendingRegistration);
        } else {
          setError(
            response.data.message || "Failed to load registration details"
          );
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching registration details:", err);
        setError("Failed to load registration details");
        setLoading(false);
      }
    };

    const fetchRooms = async () => {
      try {
        const roomsResponse = await axios.get("/api/rooms");
        setRooms(roomsResponse.data.rooms);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError("Failed to load rooms");
        setLoading(false);
      }
    };

    if (id) {
      fetchRegistrationDetails();
      fetchRooms();
    }
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      months: checked
        ? [...prev.months, value]
        : prev.months.filter((month) => month !== value),
    }));
  };

  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRoom = rooms.find((room) => room._id === e.target.value);
    setFormData((prev) => ({
      ...prev,
      roomId: e.target.value,
      roomNumber: selectedRoom ? selectedRoom.roomNumber : "",
    }));
  };

  const openConfirmDialog = () => {
    setShowConfirmDialog(true);
  };

  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.roomId) {
      setError("Please select a room");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    if (formData.months.length === 0) {
      setError("Please select at least one month for payment");
      return;
    }

    try {
      setConfirmLoading(true);
      setError("");

      const response = await axios.post(
        `/api/pending-registrations/${id}/confirm`,
        {
          roomId: formData.roomId,
          checkInDate: new Date(formData.checkInDate).toISOString(),
          paymentDetails: {
            amount: Number(formData.amount),
            months: formData.months,
            paymentMethod: formData.paymentMethod,
            paymentStatus: formData.paymentStatus,
          },
          depositAmount: formData.depositAmount
            ? Number(formData.depositAmount)
            : 0,
          keyIssued: formData.keyIssued,
        }
      );

      if (response.data.success) {
        setConfirmSuccess(true);
        setShowConfirmDialog(false);
        // Refresh registration data to show updated registrationStatus
        const selectedRoom = rooms.find((room) => room._id === formData.roomId);
        setRegistration((prev) =>
          prev
            ? {
                ...prev,
                registrationStatus: "Approved",
                roomId: selectedRoom || formData.roomId,
                checkInDate: formData.checkInDate,
                pgId: response.data.pgId,
              }
            : null
        );
      } else {
        setError(response.data.message || "Failed to confirm registration");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Registration confirmation error:", err.response?.data);

        // Handle specific error cases with more user-friendly messages
        const statusCode = err.response?.status;
        if (statusCode === 409) {
          setError(
            "This registration has already been processed. Please refresh the page."
          );
        } else if (statusCode === 404) {
          setError(
            "The registration or room could not be found. It may have been deleted."
          );
        } else if (err.response?.data?.message?.includes("MongoDB")) {
          setError(
            "A database error occurred. Please try again or contact the system administrator."
          );
        } else {
          setError(
            err.response?.data?.message ||
              "An error occurred while confirming the registration"
          );
        }
      } else {
        console.error("Unexpected error during confirmation:", err);
        setError("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setRejectLoading(true);
      setError("");

      const response = await axios.post(
        `/api/pending-registrations/${id}/reject`
      );

      if (response.data.success) {
        setRejectSuccess(true);
        // Refresh registration data to show updated registrationStatus
        setRegistration((prev) =>
          prev ? { ...prev, registrationStatus: "Rejected" } : null
        );
      } else {
        setError(response.data.message || "Failed to reject registration");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "An error occurred while rejecting the registration"
        );
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setRejectLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-pink-600" />
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl p-8">
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-red-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Registration Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The requested registration could not be found or may have been
              deleted.
            </p>
            <Link
              href="/admin/pending-registrations"
              className="inline-flex items-center px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md transition-colors"
            >
              Back to Registrations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/admin/pending-registrations"
            className="inline-flex items-center text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Registrations
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="mb-6 bg-red-100/80 dark:bg-red-900/30 backdrop-blur-sm border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl relative flex items-center"
            role="alert"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="block sm:inline text-sm">{error}</span>
          </div>
        )}

        {/* Success messages */}
        {confirmSuccess && (
          <div
            className="mb-6 bg-green-100/80 dark:bg-green-900/30 backdrop-blur-sm border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl relative flex items-center"
            role="alert"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="block sm:inline text-sm">
              Registration approved successfully! Login credentials have been
              sent to the applicant&apos;s email.
              {registration.pgId && (
                <span className="font-medium"> PG ID: {registration.pgId}</span>
              )}
            </span>
          </div>
        )}

        {rejectSuccess && (
          <div
            className="mb-6 bg-yellow-100/80 dark:bg-yellow-900/30 backdrop-blur-sm border border-yellow-200 dark:border-yellow-800/50 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-xl relative flex items-center"
            role="alert"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v5a1 1 0 102 0V7zm0 7a1 1 0 110 2 1 1 0 010-2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="block sm:inline text-sm">
              Registration has been rejected.
            </span>
          </div>
        )}

        {/* Registration Details Card */}
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden">
          {/* Header with registrationStatus */}
          <div className="bg-white/50 dark:bg-gray-900/50 p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Registration Details
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Submitted on{" "}
                  {new Date(registration.createdAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                  registration.registrationStatus === "Pending"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    : registration.registrationStatus === "Approved"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {registration.registrationStatus}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white border-b border-gray-200/50 dark:border-gray-700/50 pb-2">
                  Personal Information
                </h3>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Full Name
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    {registration.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Father&apos;s Name
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    {registration.fathersName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Email Address
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    {registration.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Mobile Number
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    {registration.phone}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Guardian&apos;s Mobile Number
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    {registration.guardianMobileNumber}
                  </p>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white border-b border-gray-200/50 dark:border-gray-700/50 pb-2">
                  Address Information
                </h3>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Permanent Address
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    {registration.permanentAddress}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    City
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    {registration.city}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    State
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    {registration.state}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Company Name
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    {registration.companyName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Company Address
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    {registration.companyAddress}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ID Type
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    {registration.validIdType}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Photos */}
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white border-b border-gray-200/50 dark:border-gray-700/50 pb-2">
                Uploaded Documents
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    ID Document
                  </p>
                  <div className="relative h-60 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <a
                      href={registration.validIdPhoto}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {registration.validIdPhoto.endsWith(".pdf") ? (
                        <div className="flex justify-center items-center h-full bg-gray-100 dark:bg-gray-800">
                          <div className="text-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-16 w-16 mx-auto text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <p className="mt-2">Click to view PDF</p>
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={registration.validIdPhoto}
                          alt="Valid ID"
                          fill
                          className="object-contain"
                        />
                      )}
                    </a>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Passport Photo
                  </p>
                  <div className="relative h-60 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <a
                      href={registration.profileImage}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Image
                        src={registration.profileImage}
                        alt="Passport Photo"
                        fill
                        className="object-contain"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Details (if Pending) */}
            {registration.registrationStatus === "Pending" && (
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white border-b border-gray-200/50 dark:border-gray-700/50 pb-2">
                  Confirmation Details
                </h3>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={openConfirmDialog}
                    className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Registration
                  </button>

                  <button
                    onClick={handleReject}
                    disabled={rejectLoading}
                    className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rejectLoading ? (
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
                      "Reject Registration"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Approved Details (if Approved) */}
            {registration.registrationStatus === "Approved" && (
              <div className="mt-8 p-4 border border-green-200 dark:border-green-800 rounded-md bg-green-50 dark:bg-green-900/20">
                <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
                  Confirmation Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      PG ID
                    </p>
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      {registration.pgId || "Not assigned"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Room Number
                    </p>
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      {registration.roomId &&
                      typeof registration.roomId === "object" &&
                      registration.roomId.roomNumber
                        ? registration.roomId.roomNumber
                        : "Not assigned"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Check-in Date
                    </p>
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      {registration.checkInDate
                        ? new Date(
                            registration.checkInDate
                          ).toLocaleDateString()
                        : "Not specified"}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  Login credentials have been sent to the applicant&apos;s email
                  address.
                </p>
              </div>
            )}

            {/* Rejected Details (if Rejected) */}
            {registration.registrationStatus === "Rejected" && (
              <div className="mt-8 p-4 border border-red-200 dark:border-red-800 rounded-md bg-red-50 dark:bg-red-900/20">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
                  Application Rejected
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400">
                  This registration request has been rejected.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
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
              Confirm Registration - {registration.name}
            </h3>

            <form onSubmit={handleConfirm} className="space-y-6">
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
                  Provide room assignment and payment details to approve this
                  registration. All fields marked with * are required.
                </p>
              </div>

              {/* Error message in dialog */}
              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
                  <div className="flex items-center">
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
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Room Assignment Section */}
                <div className="md:col-span-2">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">
                    Room Assignment
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Room field */}
                    <div>
                      <label
                        htmlFor="room"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Room *
                      </label>
                      <CustomSelect
                        value={formData.roomId}
                        onChange={(value) => {
                          const selectedRoom = rooms.find(
                            (room) => room._id === value
                          );
                          setFormData((prev) => ({
                            ...prev,
                            roomId: value,
                            roomNumber: selectedRoom
                              ? selectedRoom.roomNumber
                              : "",
                          }));
                        }}
                        placeholder="Select a room"
                        options={rooms.map((room) => ({
                          value: room._id,
                          label: `Room ${room.roomNumber} - ${room.type} (${room.currentOccupancy}/${room.capacity})`,
                          building: room.building,
                        }))}
                      />
                      {formData.roomNumber && (
                        <div className="mt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Building:
                            </span>
                            <span
                              className={`inline-block w-3 h-3 rounded-full ${
                                rooms.find(
                                  (r) => r.roomNumber === formData.roomNumber
                                )?.building === "A"
                                  ? "bg-blue-500"
                                  : rooms.find(
                                        (r) =>
                                          r.roomNumber === formData.roomNumber
                                      )?.building === "B"
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                              }`}
                            ></span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Building{" "}
                              {rooms.find(
                                (r) => r.roomNumber === formData.roomNumber
                              )?.building || "Other"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Check-in Date field */}
                    <div>
                      <label
                        htmlFor="checkInDate"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Check-in Date *
                      </label>
                      <input
                        type="date"
                        id="checkInDate"
                        name="checkInDate"
                        value={formData.checkInDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Section */}
                <div className="md:col-span-2">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">
                    Payment Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Amount field */}
                    <div>
                      <label
                        htmlFor="amount"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Amount (₹) *
                      </label>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                        placeholder="Enter payment amount"
                      />
                    </div>

                    {/* Deposit Amount field */}
                    <div>
                      <label
                        htmlFor="depositAmount"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Security Deposit (₹)
                      </label>
                      <input
                        type="number"
                        id="depositAmount"
                        name="depositAmount"
                        value={formData.depositAmount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                        placeholder="Enter security deposit amount"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Payment Method field */}
                    <div>
                      <label
                        htmlFor="paymentMethod"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Payment Method *
                      </label>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                      </select>
                    </div>

                    {/* Payment Status field */}
                    <div>
                      <label
                        htmlFor="paymentStatus"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Payment Status *
                      </label>
                      <select
                        id="paymentStatus"
                        name="paymentStatus"
                        value={formData.paymentStatus}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Month field */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Months *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 border border-gray-300 dark:border-gray-700 rounded-md max-h-60 overflow-y-auto">
                    {Array.from({ length: 12 }, (_, i) => {
                      const date = new Date();
                      date.setDate(1);
                      date.setMonth(date.getMonth() + i);
                      const month = date.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      });
                      return (
                        <label
                          key={month}
                          className="flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            value={month}
                            checked={formData.months.includes(month)}
                            onChange={handleMonthChange}
                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-700"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {month}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Select the months for which payment is being made
                  </p>
                  {formData.months.length > 0 && (
                    <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Selected: {formData.months.join(", ")}
                    </div>
                  )}
                </div>

                {/* Key Status */}
                <div className="md:col-span-2 mt-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">
                    Key Status
                  </h4>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="keyIssued"
                      name="keyIssued"
                      checked={formData.keyIssued}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          keyIssued: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="keyIssued"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      Room key issued to resident
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Check this box if you've provided the room key to the
                    resident
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeConfirmDialog}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    confirmLoading ||
                    !formData.roomId ||
                    !formData.amount ||
                    formData.months.length === 0
                  }
                  className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {confirmLoading ? (
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
                      Confirm Registration
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
