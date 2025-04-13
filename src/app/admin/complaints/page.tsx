"use client";

import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
  pgId: string;
}

interface Complaint {
  _id: string;
  userId: User;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High";
  createdAt: string;
  updatedAt: string;
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/complaints");
      setComplaints(response.data.complaints || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError("Failed to load complaints data");
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter((complaint) =>
    statusFilter === "all" ? true : complaint.status === statusFilter
  );

  const updateComplaintStatus = async (
    id: string,
    status: "Open" | "In Progress" | "Resolved" | "Closed"
  ) => {
    try {
      const response = await axios.put(`/api/complaints/${id}`, { status });
      if (response.data.success) {
        setComplaints(
          complaints.map((complaint) =>
            complaint._id === id ? { ...complaint, status } : complaint
          )
        );
        if (selectedComplaint && selectedComplaint._id === id) {
          setSelectedComplaint({ ...selectedComplaint, status });
        }
      } else {
        setError(response.data.message || "Failed to update complaint status");
      }
    } catch (err: unknown) {
      console.error("Error updating complaint status:", err);
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<{ message?: string }>;
        if (axiosError.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          setError(
            axiosError.response.data?.message ||
              `Error: ${axiosError.response.status} - ${axiosError.response.statusText}`
          );
        } else if (axiosError.request) {
          // The request was made but no response was received
          setError("No response received from server. Please try again.");
        } else {
          // Something happened in setting up the request that triggered an Error
          setError(
            axiosError.message ||
              "An error occurred while updating the complaint"
          );
        }
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-pink-500 animate-spin"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/40 rounded-2xl p-6 mb-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                Complaints Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage user complaints
              </p>
            </div>
          </div>
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

        {/* Status filter */}
        <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-4 mb-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                statusFilter === "all"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                  : "bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("Open")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                statusFilter === "Open"
                  ? "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                  : "bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80"
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setStatusFilter("In Progress")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                statusFilter === "In Progress"
                  ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white"
                  : "bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80"
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter("Resolved")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                statusFilter === "Resolved"
                  ? "bg-gradient-to-r from-green-500 to-teal-600 text-white"
                  : "bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80"
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => setStatusFilter("Closed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                statusFilter === "Closed"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                  : "bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80"
              }`}
            >
              Closed
            </button>
          </div>
        </div>

        {/* Complaints list */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint) => (
              <div
                key={complaint._id}
                onClick={() => {
                  setSelectedComplaint(complaint);
                  setShowModal(true);
                }}
                className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-lg p-4 cursor-pointer hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {complaint.userId?.name
                        ? complaint.userId.name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {complaint.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {complaint.userId?.name} ({complaint.userId?.pgId})
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatDate(complaint.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        complaint.status === "Open"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                          : complaint.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
                            : complaint.status === "Resolved"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                      }`}
                    >
                      {complaint.status}
                    </span>
                    <span
                      className={`mt-2 px-2 py-1 text-xs rounded-full font-semibold ${
                        complaint.priority === "High"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                          : complaint.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                      }`}
                    >
                      {complaint.priority} Priority
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-8 border border-white/20 dark:border-gray-700/30 shadow-lg text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                No complaints found with the selected filter
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Complaint Detail Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 backdrop-blur-sm transition-opacity"></div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom backdrop-blur-lg bg-white/90 dark:bg-gray-800/90 rounded-2xl border border-white/20 dark:border-gray-700/30 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedComplaint.title}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
                </button>
              </div>

              <div className="mb-4 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  {selectedComplaint.userId?.name
                    ? selectedComplaint.userId.name.charAt(0).toUpperCase()
                    : "U"}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedComplaint.userId?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedComplaint.userId?.email} | PG ID:{" "}
                    {selectedComplaint.userId?.pgId}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status:
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                      selectedComplaint.status === "Open"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                        : selectedComplaint.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
                          : selectedComplaint.status === "Resolved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                    }`}
                  >
                    {selectedComplaint.status}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Priority:
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                      selectedComplaint.priority === "High"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                        : selectedComplaint.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                    }`}
                  >
                    {selectedComplaint.priority}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Created:
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(selectedComplaint.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Last Updated:
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(selectedComplaint.updatedAt)}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-gray-100/70 dark:bg-gray-700/40 mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Description
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-line">
                  {selectedComplaint.description}
                </p>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Update Status
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={() =>
                      updateComplaintStatus(selectedComplaint._id, "Open")
                    }
                    className={`px-3 py-2 rounded-lg text-xs font-medium ${
                      selectedComplaint.status === "Open"
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                        : "bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20"
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() =>
                      updateComplaintStatus(
                        selectedComplaint._id,
                        "In Progress"
                      )
                    }
                    className={`px-3 py-2 rounded-lg text-xs font-medium ${
                      selectedComplaint.status === "In Progress"
                        ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white"
                        : "bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() =>
                      updateComplaintStatus(selectedComplaint._id, "Resolved")
                    }
                    className={`px-3 py-2 rounded-lg text-xs font-medium ${
                      selectedComplaint.status === "Resolved"
                        ? "bg-gradient-to-r from-green-500 to-teal-600 text-white"
                        : "bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/20"
                    }`}
                  >
                    Resolved
                  </button>
                  <button
                    onClick={() =>
                      updateComplaintStatus(selectedComplaint._id, "Closed")
                    }
                    className={`px-3 py-2 rounded-lg text-xs font-medium ${
                      selectedComplaint.status === "Closed"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                        : "bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                    }`}
                  >
                    Closed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
