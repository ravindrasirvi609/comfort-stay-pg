"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Mail,
  Clock,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";

interface Subscriber {
  _id: string;
  email: string;
  subscriptionDate: string;
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

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  });

  useEffect(() => {
    fetchSubscribers();
  }, [pagination.page]);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/subscribers?page=${pagination.page}&limit=${pagination.limit}`
      );

      if (response.data.success) {
        setSubscribers(response.data.subscribers);
        setPagination(response.data.pagination);
      } else {
        toast.error("Failed to load subscribers");
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      toast.error("Error loading subscribers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const unsubscribe = async (id: string) => {
    try {
      const response = await axios.patch(`/api/subscribers/${id}`, {
        isActive: false,
      });

      if (response.data.success) {
        toast.success("Subscriber removed successfully");
        fetchSubscribers();
      } else {
        toast.error(response.data.message || "Failed to remove subscriber");
      }
    } catch (error) {
      console.error("Error removing subscriber:", error);
      toast.error("Failed to remove subscriber. Please try again.");
    }
  };

  const exportSubscriberList = () => {
    // Create CSV content
    const headers = ["Email", "Subscription Date"];
    const csvContent =
      headers.join(",") +
      "\n" +
      subscribers
        .map(
          (sub) =>
            `"${sub.email}","${new Date(sub.subscriptionDate).toLocaleDateString()}"`
        )
        .join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    // Set link properties
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `subscribers_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    // Append to document, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>

        <button
          onClick={exportSubscriberList}
          disabled={loading || subscribers.length === 0}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={16} className="mr-2" />
          Export CSV
        </button>
      </div>

      {/* Subscribers count */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-sm">
        <p className="text-lg">
          Total Active Subscribers:{" "}
          <span className="font-semibold">{pagination.total}</span>
        </p>
      </div>

      {/* Subscribers list */}
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <FaSpinner className="animate-spin text-4xl text-pink-600" />
        </div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            No subscribers found
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Subscribed On
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {subscribers.map((subscriber) => (
                  <tr
                    key={subscriber._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Mail size={16} className="mr-2 text-pink-500" />
                        <a
                          href={`mailto:${subscriber.email}`}
                          className="text-gray-900 dark:text-gray-100 hover:underline"
                        >
                          {subscriber.email}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <Clock size={16} className="mr-2" />
                        {formatDate(subscriber.subscriptionDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => unsubscribe(subscriber._id)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        title="Remove subscriber"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
