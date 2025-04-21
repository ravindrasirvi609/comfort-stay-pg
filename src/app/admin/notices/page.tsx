"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBell, FaPlus, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-hot-toast";

interface Notice {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  createdBy: {
    name: string;
  };
  isActive: boolean;
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/notices");
      if (response.data.success) {
        setNotices(response.data.notices || []);
      } else {
        setError("Failed to load notices");
      }
    } catch (err) {
      console.error("Error fetching notices:", err);
      setError("Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post("/api/notices", formData);

      if (response.data.success) {
        toast.success("Notice created successfully");
        setFormData({ title: "", description: "" });
        setIsFormOpen(false);
        fetchNotices();
      } else {
        toast.error(response.data.message || "Failed to create notice");
      }
    } catch (err: any) {
      console.error("Error creating notice:", err);
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noticeId: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) {
      return;
    }

    try {
      const response = await axios.delete(`/api/notices/${noticeId}`);

      if (response.data.success) {
        toast.success("Notice deleted successfully");
        fetchNotices();
      } else {
        toast.error(response.data.message || "Failed to delete notice");
      }
    } catch (err: any) {
      console.error("Error deleting notice:", err);
      toast.error(err.response?.data?.message || "An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <FaBell className="mr-3 text-pink-600" />
          Notice Management
        </h1>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          {isFormOpen ? (
            "Cancel"
          ) : (
            <>
              <FaPlus className="mr-2" /> Create Notice
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          {error}
        </div>
      )}

      {isFormOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Create New Notice
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="Notice Title"
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="Notice description..."
                required
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="mr-4 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create Notice"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md rounded-xl shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">
            All Notices
          </h2>
        </div>

        {notices.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <FaBell className="h-8 w-8 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No notices yet
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Create your first notice to inform users about important
              announcements.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notices.map((notice) => (
              <div
                key={notice._id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      {notice.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-line">
                      {notice.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        Posted by:{" "}
                        <span className="font-medium">
                          {notice.createdBy?.name || "Admin"}
                        </span>
                      </span>
                      <span className="mx-2">•</span>
                      <span>
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
                  </div>
                  <button
                    onClick={() => handleDelete(notice._id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-2"
                    title="Delete notice"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
