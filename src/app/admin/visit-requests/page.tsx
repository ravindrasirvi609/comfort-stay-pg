"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface VisitRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  status: "Pending" | "Scheduled" | "Completed" | "Cancelled";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function VisitRequests() {
  const [requests, setRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "scheduled" | "completed" | "cancelled"
  >("all");
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  useEffect(() => {
    fetchVisitRequests();
  }, [filter, pagination.page]);

  const fetchVisitRequests = async () => {
    setLoading(true);
    try {
      let url = `/api/visit-requests?page=${pagination.page}&limit=${pagination.limit}`;

      if (filter !== "all") {
        url += `&status=${filter.charAt(0).toUpperCase() + filter.slice(1)}`;
      }

      const response = await axios.get(url);

      if (response.data.success) {
        setRequests(response.data.visitRequests);
        setPagination(response.data.pagination);
      } else {
        toast.error("Failed to load visit requests");
      }
    } catch (error) {
      console.error("Error fetching visit requests:", error);
      toast.error("Error loading requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await axios.patch(`/api/visit-requests/${id}`, {
        status,
      });

      if (response.data.success) {
        toast.success(`Status updated to ${status}`);
        fetchVisitRequests();
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating request status:", error);
      toast.error("Failed to update status. Please try again.");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Visit Requests</h1>

      {/* Filter controls */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg ${
              filter === "all"
                ? "bg-pink-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg ${
              filter === "pending"
                ? "bg-pink-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("scheduled")}
            className={`px-4 py-2 rounded-lg ${
              filter === "scheduled"
                ? "bg-pink-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`}
          >
            Scheduled
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg ${
              filter === "completed"
                ? "bg-pink-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter("cancelled")}
            className={`px-4 py-2 rounded-lg ${
              filter === "cancelled"
                ? "bg-pink-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Visit requests list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            No visit requests found
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between flex-wrap gap-4 mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  {request.name}
                  <span
                    className={`ml-3 text-xs px-2 py-1 rounded ${getStatusColor(request.status)}`}
                  >
                    {request.status}
                  </span>
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock size={16} className="mr-1" />
                  Requested on {formatDate(request.createdAt)}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Mail size={16} className="mr-2 text-pink-500" />
                    <a
                      href={`mailto:${request.email}`}
                      className="hover:underline"
                    >
                      {request.email}
                    </a>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Phone size={16} className="mr-2 text-pink-500" />
                    <a
                      href={`tel:${request.phone}`}
                      className="hover:underline"
                    >
                      {request.phone}
                    </a>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Calendar size={16} className="mr-2 text-pink-500" />
                    Preferred Date:{" "}
                    <span className="font-medium ml-1">
                      {formatDate(request.preferredDate)}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Clock size={16} className="mr-2 text-pink-500" />
                    Preferred Time:{" "}
                    <span className="font-medium ml-1">
                      {request.preferredTime}
                    </span>
                  </div>
                </div>
              </div>

              {request.message && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {request.message}
                  </p>
                </div>
              )}

              {request.status === "Pending" && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => updateStatus(request._id, "Scheduled")}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <Calendar size={16} className="mr-2" />
                    Schedule
                  </button>
                  <button
                    onClick={() => updateStatus(request._id, "Cancelled")}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <X size={16} className="mr-2" />
                    Cancel
                  </button>
                </div>
              )}

              {request.status === "Scheduled" && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => updateStatus(request._id, "Completed")}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <Check size={16} className="mr-2" />
                    Mark as Completed
                  </button>
                  <button
                    onClick={() => updateStatus(request._id, "Cancelled")}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <X size={16} className="mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-md border bg-white dark:bg-gray-800 disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="px-4 py-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-md border bg-white dark:bg-gray-800 disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
