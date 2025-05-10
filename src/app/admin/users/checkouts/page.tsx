"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Download,
  Filter,
  Search,
  User,
  Calendar,
  BarChart,
  TrendingUp,
  TrendingDown,
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
  moveInDate: string;
  moveOutDate: string;
  archiveDate: string;
  archiveReason: string;
  stayDuration: number;
  exitSurveyCompleted: boolean;
  exitFeedback?: ExitFeedback;
}

interface AnalyticsData {
  totalCheckouts: number;
  avgStayDuration: number;
  surveyCompletionRate: number;
  topExitReasons: { reason: string; count: number }[];
  avgRatings: {
    overallExperience: number;
    cleanliness: number;
    facilities: number;
    staff: number;
    foodQuality: number;
    valueForMoney: number;
  };
  recommendationRate: number;
}

export default function CheckoutsPage() {
  const router = useRouter();
  const [archives, setArchives] = useState<UserArchive[]>([]);
  const [filteredArchives, setFilteredArchives] = useState<UserArchive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    fetchArchives();
  }, []);

  const fetchArchives = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/user-archives");

      if (response.data.success) {
        setArchives(response.data.archives);
        setFilteredArchives(response.data.archives);
        calculateAnalytics(response.data.archives);
      } else {
        setError("Failed to load data");
      }
    } catch (err) {
      console.error("Error fetching archives:", err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (data: UserArchive[]) => {
    if (!data.length) {
      setAnalytics(null);
      return;
    }

    // Count of records with survey completed
    const surveysCompleted = data.filter((u) => u.exitSurveyCompleted).length;

    // Calculate average stay duration
    const totalDuration = data.reduce(
      (sum, user) => sum + user.stayDuration,
      0
    );

    // Count exit reasons
    const reasonCounts: Record<string, number> = {};
    data.forEach((user) => {
      const reason = user.archiveReason;
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    // Sort reasons by frequency
    const topReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate average ratings for users who completed surveys
    const usersWithSurvey = data.filter(
      (u) => u.exitSurveyCompleted && u.exitFeedback
    );

    const avgRatings = {
      overallExperience: 0,
      cleanliness: 0,
      facilities: 0,
      staff: 0,
      foodQuality: 0,
      valueForMoney: 0,
    };

    let recommendCount = 0;

    if (usersWithSurvey.length > 0) {
      for (const category of Object.keys(avgRatings)) {
        const sum = usersWithSurvey.reduce(
          (total, user) =>
            total +
            (user.exitFeedback?.[category as keyof typeof avgRatings] || 0),
          0
        );
        avgRatings[category as keyof typeof avgRatings] =
          sum / usersWithSurvey.length;
      }

      recommendCount = usersWithSurvey.filter(
        (u) => u.exitFeedback?.wouldRecommend
      ).length;
    }

    setAnalytics({
      totalCheckouts: data.length,
      avgStayDuration: data.length ? totalDuration / data.length : 0,
      surveyCompletionRate: data.length
        ? (surveysCompleted / data.length) * 100
        : 0,
      topExitReasons: topReasons.slice(0, 5),
      avgRatings,
      recommendationRate: usersWithSurvey.length
        ? (recommendCount / usersWithSurvey.length) * 100
        : 0,
    });
  };

  useEffect(() => {
    // Apply filters
    let results = [...archives];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.pgId?.toLowerCase().includes(term) ||
          user.phone.toLowerCase().includes(term)
      );
    }

    // Apply time filter
    if (timeFilter !== "all") {
      const now = new Date();
      const pastDate = new Date();

      switch (timeFilter) {
        case "month":
          pastDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          pastDate.setMonth(now.getMonth() - 3);
          break;
        case "6months":
          pastDate.setMonth(now.getMonth() - 6);
          break;
        case "year":
          pastDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      results = results.filter((user) => {
        const archiveDate = new Date(user.archiveDate);
        return archiveDate >= pastDate && archiveDate <= now;
      });
    }

    // Apply reason filter
    if (reasonFilter !== "all") {
      results = results.filter((user) => user.archiveReason === reasonFilter);
    }

    setFilteredArchives(results);
  }, [searchTerm, timeFilter, reasonFilter, archives]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTimeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeFilter(e.target.value);
  };

  const handleReasonFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setReasonFilter(e.target.value);
  };

  const exportToCSV = () => {
    if (filteredArchives.length === 0) return;

    const headers = [
      "Name",
      "Email",
      "Phone",
      "PG ID",
      "Move In Date",
      "Move Out Date",
      "Stay Duration (Days)",
      "Archive Reason",
      "Survey Completed",
      "Overall Rating",
      "Would Recommend",
      "Exit Reason",
      "Comments",
    ];

    const csvRows = [
      headers.join(","),
      ...filteredArchives.map((user) => {
        const row = [
          `"${user.name}"`,
          `"${user.email}"`,
          `"${user.phone}"`,
          `"${user.pgId || ""}"`,
          `"${new Date(user.moveInDate).toLocaleDateString()}"`,
          `"${new Date(user.moveOutDate).toLocaleDateString()}"`,
          user.stayDuration,
          `"${user.archiveReason}"`,
          user.exitSurveyCompleted ? "Yes" : "No",
          user.exitFeedback?.overallExperience || "N/A",
          user.exitFeedback?.wouldRecommend ? "Yes" : "No",
          `"${user.exitFeedback?.exitReason || ""}"`,
          `"${user.exitFeedback?.otherComments || ""}"`,
        ];
        return row.join(",");
      }),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `checkout-data-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewUserArchiveDetails = (id: string) => {
    router.push(`/admin/users/checkouts/${id}`);
  };

  const toggleAnalyticsView = () => {
    setShowAnalytics(!showAnalytics);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            User Archives & Deactivated Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View all former users who have checked out or been deactivated
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button
            onClick={toggleAnalyticsView}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            {showAnalytics ? (
              <User size={16} className="mr-2" />
            ) : (
              <BarChart size={16} className="mr-2" />
            )}
            {showAnalytics ? "View Users" : "View Analytics"}
          </button>
          <button
            onClick={exportToCSV}
            disabled={filteredArchives.length === 0}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition"
          >
            <Download size={16} className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-600 rounded-md">{error}</div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search input */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, email, or PG ID..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <Search
                    size={18}
                    className="absolute left-3 top-2.5 text-gray-400"
                  />
                </div>
              </div>

              {/* Time filter */}
              <div className="min-w-[200px]">
                <div className="flex items-center space-x-2 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700">
                  <Calendar size={18} className="text-gray-400" />
                  <select
                    value={timeFilter}
                    onChange={handleTimeFilterChange}
                    className="flex-1 bg-transparent text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="all">All Time</option>
                    <option value="month">Last Month</option>
                    <option value="3months">Last 3 Months</option>
                    <option value="6months">Last 6 Months</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
              </div>

              {/* Reason filter */}
              <div className="min-w-[200px]">
                <div className="flex items-center space-x-2 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700">
                  <Filter size={18} className="text-gray-400" />
                  <select
                    value={reasonFilter}
                    onChange={handleReasonFilterChange}
                    className="flex-1 bg-transparent text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="all">All Reasons</option>
                    <option value="Completed Stay">Completed Stay</option>
                    <option value="Early Departure">Early Departure</option>
                    <option value="Rule Violation">Rule Violation</option>
                    <option value="Payment Issues">Payment Issues</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {showAnalytics && analytics ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                Checkout Analytics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                  <h3 className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                    Total Checkouts
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {analytics.totalCheckouts}
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="text-green-600 dark:text-green-400 font-medium text-sm">
                    Average Stay Duration
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {analytics.avgStayDuration.toFixed(1)} days
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                    Survey Completion Rate
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {analytics.surveyCompletionRate.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Top Exit Reasons
                  </h3>
                  <div className="space-y-3">
                    {analytics.topExitReasons.map((reason, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-700 dark:text-gray-300">
                          {reason.reason}
                        </span>
                        <div className="flex items-center">
                          <span className="text-gray-900 dark:text-white font-medium mr-2">
                            {reason.count}
                          </span>
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full"
                              style={{
                                width: `${(reason.count / analytics.totalCheckouts) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Average Ratings
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(analytics.avgRatings).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center"
                        >
                          <span className="text-gray-700 dark:text-gray-300">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </span>
                          <div className="flex items-center">
                            <span className="text-gray-900 dark:text-white font-medium mr-2">
                              {value.toFixed(1)}
                            </span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <div key={star} className="w-4 h-4 ml-1">
                                  {star <= Math.round(value) ? (
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
                        </div>
                      )
                    )}

                    <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
                      <span className="text-gray-700 dark:text-gray-300">
                        Would Recommend
                      </span>
                      <div className="flex items-center">
                        <span className="text-gray-900 dark:text-white font-medium">
                          {analytics.recommendationRate.toFixed(1)}%
                        </span>
                        {analytics.recommendationRate > 70 ? (
                          <TrendingUp
                            size={16}
                            className="ml-2 text-green-500"
                          />
                        ) : analytics.recommendationRate < 50 ? (
                          <TrendingDown
                            size={16}
                            className="ml-2 text-red-500"
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {filteredArchives.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No checkout records found matching your criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Stay Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Survey
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Rating
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredArchives.map((user) => (
                        <tr
                          key={user._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => viewUserArchiveDetails(user._id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {user.email}
                                </div>
                                {user.pgId && (
                                  <div className="text-xs text-gray-400 dark:text-gray-500">
                                    ID: {user.pgId}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {new Date(user.moveInDate).toLocaleDateString()} -{" "}
                              {new Date(user.moveOutDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Checked out:{" "}
                              {new Date(user.archiveDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {user.stayDuration} days
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                user.archiveReason === "Completed Stay"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : user.archiveReason === "Rule Violation"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              }`}
                            >
                              {user.archiveReason}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.exitSurveyCompleted ? (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                                Completed
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                                Not Completed
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.exitFeedback ? (
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900 dark:text-white mr-1">
                                  {user.exitFeedback.overallExperience}
                                </span>
                                <svg
                                  fill="currentColor"
                                  className="w-4 h-4 text-yellow-400"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                N/A
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
