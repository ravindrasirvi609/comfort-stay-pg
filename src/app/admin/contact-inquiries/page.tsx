"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Mail,
  Phone,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ContactInquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  respondedTo: boolean;
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

export default function ContactInquiries() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "responded" | "pending">("all");
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  useEffect(() => {
    fetchInquiries();
  }, [filter, pagination.page]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      let url = `/api/contact-inquiries?page=${pagination.page}&limit=${pagination.limit}`;

      if (filter === "responded") {
        url += "&responded=true";
      } else if (filter === "pending") {
        url += "&responded=false";
      }

      const response = await axios.get(url);

      if (response.data.success) {
        setInquiries(response.data.inquiries);
        setPagination(response.data.pagination);
      } else {
        toast.error("Failed to load contact inquiries");
      }
    } catch (error) {
      console.error("Error fetching contact inquiries:", error);
      toast.error("Error loading inquiries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const markAsResponded = async (id: string) => {
    try {
      const response = await axios.patch(`/api/contact-inquiries/${id}`, {
        respondedTo: true,
      });

      if (response.data.success) {
        toast.success("Marked as responded");
        fetchInquiries();
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating inquiry status:", error);
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
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Contact Inquiries</h1>

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
            All Inquiries
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
            onClick={() => setFilter("responded")}
            className={`px-4 py-2 rounded-lg ${
              filter === "responded"
                ? "bg-pink-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`}
          >
            Responded
          </button>
        </div>
      </div>

      {/* Inquiries list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No inquiries found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between flex-wrap gap-4 mb-4">
                <h2 className="text-xl font-semibold">
                  {inquiry.name}
                  <span
                    className={`ml-3 text-xs px-2 py-1 rounded ${
                      inquiry.respondedTo
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {inquiry.respondedTo ? "Responded" : "Pending"}
                  </span>
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock size={16} className="mr-1" />
                  {formatDate(inquiry.createdAt)}
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-y-2 gap-x-6">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Mail size={16} className="mr-2 text-pink-500" />
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="hover:underline"
                  >
                    {inquiry.email}
                  </a>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Phone size={16} className="mr-2 text-pink-500" />
                  <a href={`tel:${inquiry.phone}`} className="hover:underline">
                    {inquiry.phone}
                  </a>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {inquiry.message}
                </p>
              </div>

              {!inquiry.respondedTo && (
                <div className="flex justify-end">
                  <button
                    onClick={() => markAsResponded(inquiry._id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <Check size={16} className="mr-2" />
                    Mark as Responded
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
