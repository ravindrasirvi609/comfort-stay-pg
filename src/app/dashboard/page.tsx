"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaBell,
  FaBookOpen,
  FaCalendarAlt,
  FaCalendarTimes,
  FaDoorClosed,
  FaDoorOpen,
  FaDownload,
  FaExclamationCircle,
  FaRupeeSign,
  FaSignOutAlt,
  FaChevronRight,
  FaBed,
  FaIdCard,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { BiSolidMessageSquareDetail } from "react-icons/bi";
import ExitSurvey from "@/components/ExitSurvey";

interface User {
  _id: string;
  name: string;
  email: string;
  pgId: string;
  phone: string;
  role?: "admin" | "user";
  roomId:
    | {
        _id: string;
        roomNumber: string;
        type: string;
        price: number;
      }
    | string
    | null;
  moveInDate: string;
  bedNumber?: number;
  guardianMobileNumber?: string;
  fathersName?: string;
  permanentAddress?: string;
  city?: string;
  state?: string;
  validIdType?: string;
  companyName?: string;
  companyAddress?: string;
  validIdPhoto?: string;
  profileImage?: string;
  isOnNoticePeriod?: boolean;
  lastStayingDate?: string;
  isActive?: boolean;
  depositFees?: number;
  moveOutDate?: string;
}

interface Payment {
  _id: string;
  userId?: string;
  amount: number;
  month: string;
  months?: string[];
  paymentStatus: string;
  paymentDate: string;
  receiptNumber: string;
  dueDate?: string;
  paymentMethod?: string;
  transactionId?: string;
}

interface Complaint {
  _id: string;
  userId?: string;
  title: string;
  description: string;
  status: string;
  priority?: string;
  category?: string;
  adminResponse?: string;
  createdAt: string;
}

interface Notice {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  createdBy: {
    name: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  // UI state
  const [roomDetails, setRoomDetails] = useState<{
    _id: string;
    roomNumber: string;
    type: string;
    price: number;
  } | null>(null);
  const [isNoticePeriodDialogOpen, setIsNoticePeriodDialogOpen] =
    useState(false);
  const [lastStayingDate, setLastStayingDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noticePeriodError, setNoticePeriodError] = useState("");
  const [noticePeriodSuccess, setNoticePeriodSuccess] = useState("");
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [isExitSurveyOpen, setIsExitSurveyOpen] = useState(false);
  const [isCompleteCheckout, setIsCompleteCheckout] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [userRes, payRes, compRes, noticeRes] = await Promise.all([
          axios.get("/api/auth/me"),
          axios.get("/api/payments"),
          axios.get("/api/complaints"),
          axios.get("/api/notices"),
        ]);

        if (userRes.data.success) {
          const u: User = userRes.data.user;
          setUser(u);
          if (u.roomId && typeof u.roomId === "object") {
            setRoomDetails(u.roomId);
          } else if (u.roomId) {
            try {
              const roomRes = await axios.get(`/api/rooms/${u.roomId}`);
              if (roomRes.data.success && roomRes.data.room) {
                setRoomDetails({
                  _id: roomRes.data.room._id,
                  roomNumber: roomRes.data.room.roomNumber,
                  type: roomRes.data.room.type,
                  price: roomRes.data.room.price,
                });
              }
            } catch {}
          }
        }

        if (payRes.data.success) setPayments(payRes.data.payments || []);
        if (compRes.data.success) setComplaints(compRes.data.complaints || []);
        if (noticeRes.data.success) setNotices(noticeRes.data.notices || []);

        setLoading(false);
      } catch {
        setError("Failed to load dashboard");
        setLoading(false);
      }
    };
    load();
  }, []);

  // Derived memoized values (must appear before any early returns to satisfy hooks rules)
  const currentMonth = useMemo(
    () =>
      new Date().toLocaleString("default", { month: "long", year: "numeric" }),
    []
  );

  const currentMonthPayment = useMemo(
    () =>
      payments.find(
        (p) =>
          p.month === currentMonth ||
          (Array.isArray(p.months) && p.months.includes(currentMonth))
      ),
    [payments, currentMonth]
  );

  const lastPaid = useMemo(
    () =>
      [...payments]
        .filter((p) => p.paymentStatus?.toLowerCase() === "paid")
        .sort(
          (a, b) =>
            new Date(b.paymentDate).getTime() -
            new Date(a.paymentDate).getTime()
        )[0],
    [payments]
  );

  const nextDuePayment = useMemo(
    () =>
      [...payments]
        .filter((p) =>
          ["due", "overdue", "partial"].includes(
            (p.paymentStatus || "").toLowerCase()
          )
        )
        .sort((a, b) => {
          const ad = a.dueDate
            ? new Date(a.dueDate).getTime()
            : Number.MAX_SAFE_INTEGER;
          const bd = b.dueDate
            ? new Date(b.dueDate).getTime()
            : Number.MAX_SAFE_INTEGER;
          return ad - bd;
        })[0],
    [payments]
  );

  const moveIn = user?.moveInDate ? new Date(user.moveInDate) : null;
  const monthsStayed = moveIn
    ? Math.max(
        0,
        (new Date().getFullYear() - moveIn.getFullYear()) * 12 +
          (new Date().getMonth() - moveIn.getMonth())
      )
    : 0;

  const activeComplaints = complaints.filter(
    (c) => (c.status || "").toLowerCase() !== "resolved"
  );

  const handleNoticePeriodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset messages
    setNoticePeriodError("");
    setNoticePeriodSuccess("");

    if (!lastStayingDate) {
      setNoticePeriodError("Please select your last staying date");
      return;
    }

    // Calculate days between today and last staying date
    const today = new Date();
    const lastDate = new Date(lastStayingDate);
    const daysDifference = Math.ceil(
      (lastDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDifference < 15) {
      setNoticePeriodError("Notice period must be at least 15 days");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await axios.post("/api/users/notice-period", {
        lastStayingDate: lastStayingDate,
        isEligibleForRefund: daysDifference > 15,
      });

      if (response.data.success) {
        setUser({
          ...user!,
          isOnNoticePeriod: true,
          lastStayingDate: lastStayingDate,
        });
        setNoticePeriodSuccess(
          response.data.message ||
            `Your notice period has been submitted successfully. ${daysDifference > 15 ? "You are eligible for a ₹1500 refund from your booking amount." : "No refund will be provided as notice period is less than 15 days."}`
        );
        // Close dialog after 2 seconds
        setTimeout(() => {
          setIsNoticePeriodDialogOpen(false);
          setNoticePeriodSuccess("");
        }, 2000);
      } else {
        setNoticePeriodError(
          response.data.message || "Failed to submit notice period"
        );
      }
    } catch (error: unknown) {
      console.error("Error submitting notice period:", error);
      if (axios.isAxiosError(error) && error.response) {
        setNoticePeriodError(
          error.response.data?.message || "Failed to submit notice period"
        );
      } else {
        setNoticePeriodError("Failed to submit notice period");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawNoticePeriod = async () => {
    // Reset messages
    setWithdrawError("");
    setWithdrawSuccess("");

    try {
      setIsSubmitting(true);

      const response = await axios.post("/api/users/notice-period", {
        isWithdrawal: true,
      });

      if (response.data.success) {
        setUser({
          ...user!,
          isOnNoticePeriod: false,
          lastStayingDate: undefined,
        });
        setWithdrawSuccess(
          response.data.message ||
            "Your notice period has been withdrawn successfully"
        );
        // Close dialog after 2 seconds
        setTimeout(() => {
          setIsWithdrawDialogOpen(false);
          setWithdrawSuccess("");
        }, 2000);
      } else {
        setWithdrawError(
          response.data.message || "Failed to withdraw notice period"
        );
      }
    } catch (error: unknown) {
      console.error("Error withdrawing notice period:", error);
      if (axios.isAxiosError(error) && error.response) {
        setWithdrawError(
          error.response.data?.message || "Failed to withdraw notice period"
        );
      } else {
        setWithdrawError("Failed to withdraw notice period");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle checkout request
  const handleCheckoutRequest = async () => {
    if (!user?._id) return;

    try {
      setIsSubmitting(true);

      // First we'll show the exit survey
      setIsCheckoutDialogOpen(false);
      setIsExitSurveyOpen(true);
    } catch (error: unknown) {
      console.error("Error starting checkout process:", error);

      setIsSubmitting(false);
    }
  };

  // Complete the checkout with survey data
  const handleCompleteSurvey = async (surveyData?: unknown) => {
    if (!user?._id) return;

    try {
      setIsSubmitting(true);

      const response = await axios.post(`/api/users/${user._id}/checkout`, {
        exitSurvey: surveyData,
        skipSurvey: !surveyData,
      });

      if (response.data.success) {
        toast.success("Checkout process completed. Thank you for your stay!");
        setIsExitSurveyOpen(false);
        setIsCompleteCheckout(true);

        // Refresh the page after a short delay
        setTimeout(() => {
          router.refresh();
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to complete checkout");
      }
    } catch (error: unknown) {
      console.error("Error completing checkout:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle survey cancellation
  const handleCancelSurvey = () => {
    setIsExitSurveyOpen(false);
    // Option to skip survey
    if (
      confirm(
        "Are you sure you want to skip the exit survey? Your feedback helps us improve."
      )
    ) {
      handleCompleteSurvey();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading your dashboard…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-8 max-w-md mx-auto">
          <div className="flex flex-col items-center">
            <FaExclamationCircle className="text-red-500 text-5xl mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Unable to load profile
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // (Duplicate derived variable block removed; variables declared earlier before early returns)

  // Helpers
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const classifyNotice = (title: string, description: string) => {
    const text = `${title} ${description}`.toLowerCase();
    if (/(emergency|outage|power|water shutdown|urgent|fire|leak)/.test(text)) {
      return {
        label: "Emergency",
        badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      };
    }
    if (/(maintenance|repair|router|wifi|cleaning)/.test(text)) {
      return {
        label: "Maintenance",
        badge:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      };
    }
    if (/(rent|payment|due|fees)/.test(text)) {
      return {
        label: "Rent",
        badge:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      };
    }
    if (/(event|festival|movie|dinner|party)/.test(text)) {
      return {
        label: "Event",
        badge:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      };
    }
    return {
      label: "General",
      badge: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300",
    };
  };

  // Return main dashboard UI
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header / Welcome Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl p-6 md:p-8 mb-8 backdrop-blur-lg bg-gradient-to-r from-pink-500/10 via-indigo-300/10 to-purple-600/10 dark:from-pink-500/10 dark:via-indigo-500/5 dark:to-purple-600/10"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white/80 dark:border-gray-800/80 shadow-lg bg-white/60 dark:bg-gray-800/60">
              {user?.profileImage && user.profileImage.trim() !== "" ? (
                <Image
                  src={user.profileImage}
                  alt={user?.name || "User"}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src="/logo.png"
                  alt="Avatar"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {greeting()}, {user?.name?.split(" ")[0]}.
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 dark:from-pink-400 dark:via-purple-400 dark:to-indigo-400">
                Here’s your PG update for today
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/70 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                  <FaIdCard className="mr-2 text-pink-500" />{" "}
                  {user?.pgId || "—"}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/70 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                  <FaDoorOpen className="mr-2 text-purple-500" /> Room{" "}
                  {roomDetails?.roomNumber ||
                    (typeof user?.roomId === "object" &&
                      user?.roomId?.roomNumber) ||
                    "Not Assigned"}
                </span>
                {user?.bedNumber && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/70 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                    <FaBed className="mr-2 text-indigo-500" /> Bed #
                    {user.bedNumber}
                  </span>
                )}
                {user?.isOnNoticePeriod && user?.lastStayingDate && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/30">
                    <FaCalendarTimes className="mr-2" /> Leaving on{" "}
                    {new Date(user.lastStayingDate).toLocaleDateString("en-IN")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Link
              href="/rules-regulations"
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            >
              <FaBookOpen className="mr-2" /> Rules
            </Link>
            {!user?.isOnNoticePeriod && !user?.moveOutDate && (
              <button
                onClick={() => setIsNoticePeriodDialogOpen(true)}
                className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <FaSignOutAlt className="mr-2" /> Submit Notice
              </button>
            )}
            {user?.isOnNoticePeriod && !user?.moveOutDate && (
              <>
                <button
                  onClick={() => setIsWithdrawDialogOpen(true)}
                  className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <FaCalendarAlt className="mr-2" /> Withdraw Notice
                </button>
                <button
                  onClick={() => setIsCheckoutDialogOpen(true)}
                  className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  <FaDoorClosed className="mr-2" /> Checkout
                </button>
              </>
            )}
            {user?.moveOutDate && (
              <div className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                <FaDoorClosed className="mr-2" /> Checked out on{" "}
                {new Date(user.moveOutDate).toLocaleDateString("en-IN")}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Alerts */}
      <div className="space-y-3 mb-6">
        {!currentMonthPayment && (
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/40">
            <FaExclamationCircle className="mt-0.5 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <p className="font-medium text-red-800 dark:text-red-300">
                Rent due — Pay now
              </p>
              <p className="text-sm text-red-700 dark:text-red-400">
                Your {currentMonth} rent{" "}
                {roomDetails?.price
                  ? `of ₹${roomDetails.price.toLocaleString("en-IN")}`
                  : ""}{" "}
                is pending.
              </p>
            </div>
            <Link
              href="#payments"
              className="text-sm font-medium text-red-700 dark:text-red-300 hover:underline flex items-center"
            >
              Pay Now <FaChevronRight className="ml-1 text-xs" />
            </Link>
          </div>
        )}
        {/* Show first emergency/maintenance notice as alert */}
        {(() => {
          const urgent = notices.find((n) =>
            /(emergency|outage|water|power|maintenance)/i.test(
              `${n.title} ${n.description}`
            )
          );
          if (!urgent) return null;
          const c = classifyNotice(urgent.title, urgent.description);
          return (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg border ${c.label === "Emergency" ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/40" : c.label === "Maintenance" ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/40" : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/40"}`}
            >
              <FaBell className="mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{urgent.title}</p>
                <p className="text-sm opacity-80 line-clamp-2">
                  {urgent.description}
                </p>
              </div>
              <Link
                href="#notices"
                className="text-sm font-medium hover:underline flex items-center"
              >
                View <FaChevronRight className="ml-1 text-xs" />
              </Link>
            </div>
          );
        })()}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        <div className="rounded-xl p-4 border bg-white/60 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 shadow-card">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FaRupeeSign className="mr-2 text-green-600" /> Rent Status
          </div>
          <div
            className={`mt-2 text-xl font-bold ${currentMonthPayment?.paymentStatus === "Paid" ? "text-green-700 dark:text-green-400" : currentMonthPayment ? (currentMonthPayment.paymentStatus === "Partial" ? "text-amber-700 dark:text-amber-400" : "text-red-700 dark:text-red-400") : "text-red-700 dark:text-red-400"}`}
          >
            {currentMonthPayment
              ? currentMonthPayment.paymentStatus
              : "Pending"}
          </div>
          <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
            {currentMonthPayment
              ? `Paid on ${new Date(currentMonthPayment.paymentDate).toLocaleDateString("en-IN")}`
              : "Tap to pay"}
          </p>
        </div>
        <div className="rounded-xl p-4 border bg-white/60 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 shadow-card">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FaCalendarAlt className="mr-2 text-indigo-600" /> Next Due
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
            {nextDuePayment?.dueDate
              ? new Date(nextDuePayment.dueDate).toLocaleDateString("en-IN")
              : currentMonthPayment
                ? "—"
                : "Due now"}
          </div>
          <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
            {nextDuePayment?.amount
              ? `₹${nextDuePayment.amount.toLocaleString("en-IN")}`
              : roomDetails?.price
                ? `₹${roomDetails.price.toLocaleString("en-IN")}`
                : ""}
          </p>
        </div>
        <div className="rounded-xl p-4 border bg-white/60 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 shadow-card">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <BiSolidMessageSquareDetail className="mr-2 text-purple-600" />{" "}
            Complaints
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
            {activeComplaints.length} Active
          </div>
          <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
            {complaints.length} total
          </p>
        </div>
        <div className="rounded-xl p-4 border bg-white/60 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 shadow-card">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FaBell className="mr-2 text-pink-600" /> Notices
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
            {notices.length}
          </div>
          <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
            Recent updates
          </p>
        </div>
        <div className="rounded-xl p-4 border bg-white/60 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 shadow-card">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FaCalendarAlt className="mr-2 text-emerald-600" /> Stay Duration
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
            {moveIn ? `${monthsStayed} months` : "—"}
          </div>
          <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
            {moveIn
              ? `Since ${moveIn.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`
              : "Move-in not set"}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Payments Section */}
          <section
            id="payments"
            className="backdrop-blur-lg bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                  <FaFileInvoiceDollar className="mr-3 text-pink-600" />{" "}
                  Payments
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last paid:{" "}
                  {lastPaid
                    ? `${new Date(lastPaid.paymentDate).toLocaleDateString("en-IN")}`
                    : "—"}
                </p>
              </div>
              {!currentMonthPayment && (
                <Link
                  href="#"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium"
                >
                  Pay Now
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Amount
                </p>
                <p className="text-lg font-semibold">
                  {roomDetails?.price
                    ? `₹${roomDetails.price.toLocaleString("en-IN")}`
                    : lastPaid?.amount
                      ? `₹${lastPaid.amount.toLocaleString("en-IN")}`
                      : "—"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Next Due
                </p>
                <p className="text-lg font-semibold">
                  {nextDuePayment?.dueDate
                    ? new Date(nextDuePayment.dueDate).toLocaleDateString(
                        "en-IN"
                      )
                    : currentMonthPayment
                      ? "—"
                      : "Due now"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Modes
                </p>
                <p className="text-sm">Cash Only</p>
              </div>
            </div>

            {payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Payment Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white/30 dark:bg-gray-800/30">
                    {payments.map((payment) => (
                      <tr
                        key={payment._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {payment.month ||
                            (payment.months && payment.months.join(", "))}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          ₹{payment.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${payment.paymentStatus === "Paid" ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : payment.paymentStatus === "Partial" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300" : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"}`}
                          >
                            {payment.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(payment.paymentDate).toLocaleDateString(
                            "en-IN",
                            { year: "numeric", month: "short", day: "numeric" }
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Link
                            href={`/api/payments/${payment._id}/receipt`}
                            className="inline-flex items-center px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm font-medium"
                          >
                            <FaDownload className="mr-1" /> Download
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="bg-gray-100 dark:bg-gray-800 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaFileInvoiceDollar className="text-gray-400 dark:text-gray-500 text-2xl" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  No payment records
                </p>
              </div>
            )}
          </section>

          {/* Notices & Announcements */}
          <section
            id="notices"
            className="backdrop-blur-lg bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center mb-4">
              <FaBell className="mr-3 text-pink-600" /> Notices & Announcements
            </h2>
            {notices.length > 0 ? (
              <div className="space-y-4">
                {notices.slice(0, 6).map((notice) => {
                  const c = classifyNotice(notice.title, notice.description);
                  return (
                    <div
                      key={notice._id}
                      className="bg-white/70 dark:bg-gray-800/70 rounded-lg border border-gray-100 dark:border-gray-700 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-medium ${c.badge}`}
                            >
                              {c.label}
                            </span>
                            <h3 className="text-base font-medium text-gray-900 dark:text-white">
                              {notice.title}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {notice.description}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {new Date(notice.createdAt).toLocaleDateString(
                            "en-IN",
                            { year: "numeric", month: "short", day: "numeric" }
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                        Posted by:{" "}
                        <span className="font-medium">
                          {notice.createdBy.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No notices right now.
              </p>
            )}
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Complaints / Requests */}
          <section
            id="complaints"
            className="backdrop-blur-lg bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                <BiSolidMessageSquareDetail className="mr-3 text-pink-600" />{" "}
                Complaints
              </h2>
              <Link
                href="/dashboard/complaints/new"
                className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm font-medium"
              >
                New
              </Link>
            </div>
            {complaints.length > 0 ? (
              <div className="space-y-3">
                {complaints.slice(0, 4).map((complaint) => (
                  <div
                    key={complaint._id}
                    className="bg-white/70 dark:bg-gray-800/70 rounded-lg border border-gray-100 dark:border-gray-700 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-medium">
                          {complaint.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {complaint.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${complaint.status === "Open" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300" : complaint.status === "In Progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300" : "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"}`}
                        >
                          {complaint.status}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(complaint.createdAt).toLocaleDateString(
                            "en-IN",
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No complaints yet.
              </p>
            )}
          </section>

          {/* Events / Activities (placeholder) */}
          <section className="backdrop-blur-lg bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
              Events & Activities
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No upcoming events.
            </p>
          </section>

          {/* House Rules & Emergency Info */}
          <section className="backdrop-blur-lg bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Important Info
            </h2>
            <div className="space-y-4">
              <Link
                href="/rules-regulations"
                className="block p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition"
              >
                📘 House Rules & Regulations
              </Link>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                <p className="font-medium mb-2">Emergency Contacts</p>
                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <li>Warden: 9823477183 </li>
                  <li>Security: 100</li>
                  <li>Ambulance: 108</li>
                  <li>
                    Nearest Hospital: Phone: 1800-210-4949 (Ruby Hall Clinic)
                  </li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                <p className="font-medium mb-2">WiFi</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Check latest WiFi details in notices.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Notice Period Dialog */}
      {isNoticePeriodDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={() => setIsNoticePeriodDialogOpen(false)}
            ></div>

            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user?.isOnNoticePeriod
                    ? "Update Notice Period"
                    : "Submit Notice Period"}
                </h3>
                <button
                  onClick={() => setIsNoticePeriodDialogOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {user?.isOnNoticePeriod
                    ? "You can update your last staying date. Your notice period will be adjusted accordingly."
                    : "Please confirm your last staying date. Once submitted, your notice period will be activated."}
                </p>
                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-lg shadow-sm mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaExclamationCircle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Notice Period Policy
                      </h3>
                      <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Minimum notice period required: 15 days</li>
                          <li>
                            If notice period is more than 15 days: ₹1500 refund
                            from booking amount
                          </li>
                          <li>
                            If notice period is less than 15 days: No refund
                            will be provided
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {noticePeriodError && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                    {noticePeriodError}
                  </div>
                )}

                {noticePeriodSuccess && (
                  <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
                    {noticePeriodSuccess}
                  </div>
                )}

                <form onSubmit={handleNoticePeriodSubmit}>
                  <div className="mb-4">
                    <label
                      htmlFor="lastStayingDate"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Last Staying Date
                    </label>
                    <input
                      type="date"
                      id="lastStayingDate"
                      value={lastStayingDate}
                      onChange={(e) => setLastStayingDate(e.target.value)}
                      min={
                        new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
                          .toISOString()
                          .split("T")[0]
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 15 days from today
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsNoticePeriodDialogOpen(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : user?.isOnNoticePeriod
                          ? "Update Notice"
                          : "Submit Notice"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Notice Period Dialog */}
      {isWithdrawDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={() => setIsWithdrawDialogOpen(false)}
            ></div>

            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Withdraw Notice Period
                </h3>
                <button
                  onClick={() => setIsWithdrawDialogOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                {withdrawError && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                    {withdrawError}
                  </div>
                )}

                {withdrawSuccess && (
                  <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
                    {withdrawSuccess}
                  </div>
                )}

                {!withdrawSuccess && (
                  <>
                    <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/30 rounded-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-yellow-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Are you sure?
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                            <p>
                              Withdrawing your notice period will cancel your
                              move-out process. You will continue to be a
                              resident without interruption.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsWithdrawDialogOpen(false)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleWithdrawNoticePeriod}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Processing..." : "Confirm Withdrawal"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Confirmation Dialog */}
      {isCheckoutDialogOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <FaExclamationCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                      id="modal-title"
                    >
                      Confirm Checkout
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to checkout? This will mark your
                        stay as completed and you will need to return your key
                        and complete the exit process with management.
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        You will also be asked to complete a short exit survey
                        to help us improve our services.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCheckoutRequest}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Proceed to Checkout"}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                  onClick={() => setIsCheckoutDialogOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit Survey Dialog */}
      {isExitSurveyOpen && user && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <ExitSurvey
                userId={user._id}
                onComplete={handleCompleteSurvey}
                onCancel={handleCancelSurvey}
              />
            </div>
          </div>
        </div>
      )}

      {/* Checkout Complete Dialog */}
      {isCompleteCheckout && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-green-600 dark:text-green-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                      id="modal-title"
                    >
                      Checkout Complete
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Thank you for your stay with us! Your checkout has been
                        processed successfully.
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Please make sure to return your keys to the management
                        before leaving. We wish you all the best!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setIsCompleteCheckout(false);
                    router.refresh();
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
