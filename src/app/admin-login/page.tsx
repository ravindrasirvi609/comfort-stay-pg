"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Admin login form state
  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle admin form input change
  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Handle admin login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // For easier development testing, allow these fixed admin credentials
      if (
        adminForm.email === "admin@comfortstay.com" &&
        adminForm.password === "admin123"
      ) {
        // Fixed credentials for development - in production, remove this and use only the API call
        router.push("/admin");
        return;
      }

      const response = await axios.post("/api/auth/admin-login", adminForm);

      if (response.data.success) {
        router.push("/admin");
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "An error occurred during login"
        );
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-40 w-72 h-72 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full backdrop-blur-lg bg-white/40 dark:bg-gray-800/50 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden p-8 z-10 hover:shadow-pink-200/20 dark:hover:shadow-pink-700/20 transition-all duration-300">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
              CS
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Login to access the admin dashboard
          </p>
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

        {/* Admin Login Form */}
        <form className="space-y-6" onSubmit={handleAdminLogin}>
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
              <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-lg p-1">
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300 pl-3 pt-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-3 pr-10 py-2.5 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                  placeholder="admin@comfortstay.com"
                  value={adminForm.email}
                  onChange={handleAdminChange}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
              <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-lg p-1">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300 pl-3 pt-1"
                >
                  Password
                </label>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-3 pr-10 py-2.5 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                  placeholder="Enter your password"
                  value={adminForm.password}
                  onChange={handleAdminChange}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
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
              ) : null}
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <div className="text-sm">
            <Link
              href="/login"
              className="font-medium text-pink-600 hover:text-pink-500 dark:text-pink-400 dark:hover:text-pink-300"
            >
              Back to Resident Login
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>For development: admin@comfortstay.com / admin123</p>
            <p>Remove this in production!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
