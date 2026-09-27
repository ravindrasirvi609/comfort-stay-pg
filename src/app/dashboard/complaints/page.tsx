"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

const PAGE_SIZE = 10;

const CATEGORY_BADGE_CLASS =
  "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

function getPriorityBadgeClass(priority: string): string {
  switch (priority) {
    case "Low":
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    case "Medium":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
    case "High":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300";
    case "Urgent":
      return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "Open":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
    case "In Progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
    case "Resolved":
      return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
    case "Closed":
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ComplaintsListPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get("/api/complaints");

        if (response.data.success) {
          setComplaints(response.data.complaints || []);
        } else {
          setError(response.data.message || "Failed to load complaints");
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message ||
              "An error occurred while loading your complaints"
          );
        } else {
          setError(
            "An unexpected error occurred while loading your complaints"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const totalPages = Math.max(1, Math.ceil(complaints.length / PAGE_SIZE));
  const paginatedComplaints = complaints.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Complaints
        </h1>
        <Link
          href="/dashboard/complaints/new"
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm whitespace-nowrap"
        >
          Submit New Complaint
        </Link>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded relative dark:bg-red-900 dark:text-red-200 dark:border-red-800"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!error && complaints.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-10 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No complaints submitted yet. If you have an issue, please let us
            know.
          </p>
          <Link
            href="/dashboard/complaints/new"
            className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm"
          >
            Submit New Complaint
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedComplaints.map((complaint) => (
              <div
                key={complaint._id}
                className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-5"
              >
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_BADGE_CLASS}`}
                  >
                    {complaint.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(
                      complaint.priority
                    )}`}
                  >
                    {complaint.priority}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                      complaint.status
                    )}`}
                  >
                    {complaint.status}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {complaint.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                  {complaint.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    Submitted {formatDate(complaint.createdAt)}
                  </span>
                  <Link
                    href={`/dashboard/complaints/${complaint._id}`}
                    className="text-sm font-medium text-pink-600 hover:text-pink-700 dark:text-pink-400"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
