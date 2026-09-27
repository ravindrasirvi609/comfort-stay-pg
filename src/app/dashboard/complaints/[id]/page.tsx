"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_ORDER = ["Open", "In Progress", "Resolved", "Closed"];

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

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ComplaintDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchComplaint = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(`/api/complaints/${id}`);

        if (response.data.success) {
          setComplaint(response.data.complaint);
        } else {
          setError(response.data.message || "Failed to load complaint");
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message ||
              "An error occurred while loading the complaint"
          );
        } else {
          setError("An unexpected error occurred while loading the complaint");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/dashboard/complaints"
          className="text-sm font-medium text-pink-600 hover:text-pink-700 dark:text-pink-400 mb-4 inline-block"
        >
          &larr; Back to Complaints
        </Link>
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:text-red-200 dark:border-red-800"
          role="alert"
        >
          <span className="block sm:inline">
            {error || "Complaint not found"}
          </span>
        </div>
      </div>
    );
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(complaint.status);
  const hasAssignedTo =
    typeof complaint.assignedTo === "string" &&
    complaint.assignedTo.trim() !== "";
  const hasResolution =
    typeof complaint.resolution === "string" &&
    complaint.resolution.trim() !== "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <Link
        href="/dashboard/complaints"
        className="text-sm font-medium text-pink-600 hover:text-pink-700 dark:text-pink-400 mb-4 inline-block"
      >
        &larr; Back to Complaints
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {complaint.title}
      </h1>

      {/* Badges row */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
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

      {/* Status timeline */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-5 mb-6">
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Status Timeline
        </h2>
        <div className="flex items-center flex-wrap gap-2">
          {STATUS_ORDER.map((s, index) => (
            <React.Fragment key={s}>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  currentStatusIndex >= 0 && index <= currentStatusIndex
                    ? "bg-pink-600 text-white"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                }`}
              >
                {s}
              </span>
              {index < STATUS_ORDER.length - 1 && (
                <span className="text-gray-300 dark:text-gray-600">
                  &rarr;
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-5 mb-6">
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Description
        </h2>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {complaint.description}
        </p>
      </div>

      {/* Assigned To */}
      {hasAssignedTo && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-5 mb-6">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Assigned To
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {complaint.assignedTo}
          </p>
        </div>
      )}

      {/* Resolution */}
      {hasResolution && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 shadow-md rounded-lg p-5 mb-6">
          <h2 className="text-xs font-bold text-green-800 dark:text-green-300 uppercase tracking-wide mb-2">
            Resolution
          </h2>
          <p className="text-green-800 dark:text-green-200 whitespace-pre-line">
            {complaint.resolution}
          </p>
        </div>
      )}

      {/* Dates */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-5">
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Dates
        </h2>
        <dl className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <dt className="text-gray-500 dark:text-gray-400">Submitted</dt>
            <dd className="text-gray-900 dark:text-white font-medium">
              {formatDateTime(complaint.createdAt)}
            </dd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <dt className="text-gray-500 dark:text-gray-400">
              Last Updated
            </dt>
            <dd className="text-gray-900 dark:text-white font-medium">
              {formatDateTime(complaint.updatedAt)}
            </dd>
          </div>
          {complaint.resolvedAt && (
            <div className="flex items-center justify-between text-sm">
              <dt className="text-gray-500 dark:text-gray-400">Resolved</dt>
              <dd className="text-gray-900 dark:text-white font-medium">
                {formatDateTime(complaint.resolvedAt)}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
