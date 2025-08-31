"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";

interface User {
  _id: string;
  name: string;
  pgId: string;
  roomId:
    | {
        _id: string;
        roomNumber: string;
        price: number;
        type: string;
      }
    | string
    | null;
}

// Payment interface (subset) to compute current month paid & dues
interface PaymentData {
  _id: string;
  userId: { id: string; _id?: string } | null;
  amount: number;
  months: string[];
  paymentStatus: "Paid" | "Due" | "Overdue" | "Partial" | "Pending";
  isDepositPayment?: boolean;
}

export default function CreatePaymentPage() {
  const router = useRouter();

  // Form states
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [amount, setAmount] = useState<number | "">("");
  const [months, setMonths] = useState<string[]>([]);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() + 30))
      .toISOString()
      .split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [transactionId, setTransactionId] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [status, setStatus] = useState<string>("Paid");
  // State for deposit payment
  const [isDepositPayment, setIsDepositPayment] = useState<boolean>(false);

  // UI states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [existingPayments, setExistingPayments] = useState<string[]>([]);
  const [checkingPayments, setCheckingPayments] = useState(false);
  // Map userId -> payment info for current month
  const [userPaymentInfo, setUserPaymentInfo] = useState<
    Record<
      string,
      {
        paidAmount: number;
        dueAmount: number;
        status: "Paid" | "Unpaid" | "N/A";
        roomPrice: number;
      }
    >
  >({});

  // Current month (e.g., "August 2025")
  const currentMonthYear = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Generate months array for month selection (last 3 months, current month, next 3 months)
  const availableMonths = [];
  const today = new Date();
  for (let i = -3; i <= 3; i++) {
    const month = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const monthStr = month.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    availableMonths.push(monthStr);
  }

  // Set default month to current month
  useEffect(() => {
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    setMonths([currentMonth]);
  }, []);

  // Fetch all users and their due information from UserDue model
  useEffect(() => {
    const fetchUsersAndPayments = async () => {
      try {
        setLoading(true);

        // Fetch users with their due information from the new API
        const usersRes = await axios.get("/api/users/with-dues");

        if (!usersRes.data.success) {
          setError("Failed to load users");
          setLoading(false);
          return;
        }

        const rawUsers: any[] = usersRes.data.users || [];

        // Only include active users with assigned rooms
        const activeUsers = rawUsers.filter(
          (user: any) =>
            user.roomId &&
            typeof user.roomId === "object" &&
            user.roomId.roomNumber
        );

        // Process users to extract due information from UserDue model
        const info: Record<
          string,
          {
            paidAmount: number;
            dueAmount: number;
            status: "Paid" | "Unpaid" | "N/A";
            roomPrice: number;
          }
        > = {};

        activeUsers.forEach((u) => {
          // Use the correct fields from /api/users/with-dues response
          const roomPrice =
            u.roomId && typeof u.roomId === "object" && u.roomId.price
              ? u.roomId.price
              : 0;

          const dueAmount = u.dueAmount || u.remainingDue || 0;
          const paidAmount = u.totalPaid || 0;
          const status =
            u.currentMonthRentStatus === "Paid"
              ? "Paid"
              : u.currentMonthRentStatus === "Unpaid"
                ? "Unpaid"
                : "N/A";

          info[u._id] = {
            paidAmount: paidAmount,
            dueAmount: dueAmount,
            status: status,
            roomPrice: roomPrice,
          };
        });

        setUsers(activeUsers);
        setFilteredUsers(activeUsers);
        setUserPaymentInfo(info);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users/payments:", err);
        setError("Failed to load users or payments");
        setLoading(false);
      }
    };

    fetchUsersAndPayments();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.pgId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof user.roomId === "object" &&
            user.roomId?.roomNumber &&
            user.roomId.roomNumber
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );

      // Sort by due amount - users with dues first
      const sortedFiltered = filtered.sort((a, b) => {
        const aDue = userPaymentInfo[a._id]?.dueAmount || 0;
        const bDue = userPaymentInfo[b._id]?.dueAmount || 0;
        if (aDue > 0 && bDue === 0) return -1; // a has due, b doesn't - a comes first
        if (aDue === 0 && bDue > 0) return 1; // b has due, a doesn't - b comes first
        if (aDue > 0 && bDue > 0) return bDue - aDue; // both have dues, higher due first
        return a.name.localeCompare(b.name); // both paid, sort by name
      });

      setFilteredUsers(sortedFiltered);
    } else {
      // Sort all users by due amount when no search term
      const sortedUsers = [...users].sort((a, b) => {
        const aDue = userPaymentInfo[a._id]?.dueAmount || 0;
        const bDue = userPaymentInfo[b._id]?.dueAmount || 0;
        if (aDue > 0 && bDue === 0) return -1;
        if (aDue === 0 && bDue > 0) return 1;
        if (aDue > 0 && bDue > 0) return bDue - aDue;
        return a.name.localeCompare(b.name);
      });
      setFilteredUsers(sortedUsers);
    }
  }, [searchTerm, users, userPaymentInfo]);

  // Set default amount when user is selected
  useEffect(() => {
    if (selectedUser) {
      const user = users.find((u) => u._id === selectedUser);
      if (
        user &&
        user.roomId &&
        typeof user.roomId === "object" &&
        user.roomId.price
      ) {
        setAmount(user.roomId.price);
      }
    }
  }, [selectedUser, users]);

  // Fetch existing payments for selected user
  const fetchExistingPayments = async (userId: string) => {
    try {
      setCheckingPayments(true);
      const response = await axios.get(`/api/payments?userId=${userId}`);
      if (response.data.success) {
        const payments = response.data.payments;
        const existingMonths = payments
          .filter(
            (payment: { isDepositPayment: boolean }) =>
              !payment.isDepositPayment
          )
          .flatMap((payment: { months: string[] }) => payment.months);
        setExistingPayments(existingMonths);
      }
    } catch (error) {
      console.error("Error fetching existing payments:", error);
    } finally {
      setCheckingPayments(false);
    }
  };

  // Handle user selection
  const handleUserSelection = (userId: string) => {
    setSelectedUser(userId);
    setMonths([]); // Reset months when user changes
    fetchExistingPayments(userId);
  };

  // Handle month selection
  const handleMonthSelection = (selectedMonth: string) => {
    setMonths((prev) => {
      // If already selected, remove it
      if (prev.includes(selectedMonth)) {
        return prev.filter((m) => m !== selectedMonth);
      }
      // Otherwise add it
      return [...prev, selectedMonth];
    });
  };

  // Handle deposit payment toggle
  const handleDepositToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setIsDepositPayment(isChecked);
    if (isChecked) {
      setStatus("Paid"); // Auto-set status to Paid for deposit payments
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser || !amount || months.length === 0 || !dueDate) {
      setError("Please fill in all required fields");
      return;
    }

    // Check for conflicting months
    const conflictingMonths = months.filter((month) =>
      existingPayments.includes(month)
    );
    if (conflictingMonths.length > 0) {
      setError(
        `Cannot create payment for months that already have payments: ${conflictingMonths.join(", ")}`
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const paymentData = {
        userId: selectedUser,
        amount: Number(amount),
        months: months,
        paymentDate,
        dueDate,
        paymentStatus: status,
        paymentMethod,
        transactionId: transactionId || undefined,
        remarks: remarks || undefined,
        isDepositPayment,
      };

      const response = await axios.post("/api/payments", paymentData);

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/payments");
        }, 2000);
      } else {
        setError(response.data.message || "Failed to create payment");
      }

      setSubmitting(false);
    } catch (err: unknown) {
      console.error("Error creating payment:", err);
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Failed to create payment"
          : "Failed to create payment"
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-pink-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/payments"
          className="flex items-center text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300 mb-2"
        >
          <FaArrowLeft className="mr-2" />
          Back to payments
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 dark:from-pink-400 dark:to-purple-500">
          Record New Payment
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create a new payment record for a resident
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900/50 dark:border-red-800 dark:text-red-400">
          <p>{error}</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded dark:bg-green-900/50 dark:border-green-800 dark:text-green-400">
          <p>Payment created successfully! Redirecting...</p>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6"
      >
        <div className="space-y-6">
          {/* User selection */}
          <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <label
              htmlFor="user"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Select Resident <span className="text-red-500">*</span>
            </label>

            {!selectedUser ? (
              <>
                <div className="relative mb-3">
                  <input
                    type="text"
                    placeholder="Search by name, PG ID or room number..."
                    className="bg-white dark:bg-gray-800 focus:ring-pink-500 focus:border-pink-500 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      <p className="font-medium">No residents found</p>
                      <p className="text-sm mt-1">Try adjusting your search</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => {
                      const paymentMeta = userPaymentInfo[user._id];
                      const roomPrice =
                        paymentMeta?.roomPrice ||
                        (typeof user.roomId === "object" &&
                          user.roomId?.price) ||
                        0;
                      const paid = paymentMeta?.paidAmount || 0;
                      const due = paymentMeta?.dueAmount || 0;
                      const status = paymentMeta?.status || "N/A";

                      return (
                        <div
                          key={user._id}
                          className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 ${
                            due > 0
                              ? "border-red-400 bg-red-50/30 dark:bg-red-900/10"
                              : status === "Paid"
                                ? "border-green-400 bg-green-50/30 dark:bg-green-900/10"
                                : "border-transparent"
                          }`}
                          onClick={() => handleUserSelection(user._id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {user.name}
                                {due > 0 && (
                                  <span className="ml-2 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded">
                                    Has Due
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 mt-1 text-sm">
                                <span className="text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                  ID: {user.pgId}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                  Room:{" "}
                                  {typeof user.roomId === "object" &&
                                  user.roomId?.roomNumber
                                    ? user.roomId.roomNumber
                                    : "Not Assigned"}
                                </span>
                                {roomPrice > 0 && (
                                  <span className="text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                    Monthly Rent: ₹
                                    {roomPrice.toLocaleString("en-IN")}
                                  </span>
                                )}
                              </div>
                              {roomPrice > 0 && (
                                <div className="mt-2 text-xs">
                                  <div className="flex flex-wrap gap-3">
                                    <span
                                      className={`px-2 py-0.5 rounded font-medium ${
                                        status === "Paid"
                                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                          : status === "Unpaid"
                                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                      }`}
                                    >
                                      {status === "Paid"
                                        ? "✅ Fully Paid"
                                        : status === "Unpaid"
                                          ? "⚠️ Has Due"
                                          : "❓ Status Unknown"}
                                    </span>
                                  </div>
                                  {status !== "N/A" && (
                                    <div className="mt-1 text-gray-600 dark:text-gray-300 space-y-1">
                                      <div>
                                        💸 <strong>Amount Due:</strong>{" "}
                                        {due > 0 ? (
                                          <span className="text-red-600 dark:text-red-400 font-bold">
                                            ₹
                                            {due.toLocaleString("en-IN", {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            })}
                                          </span>
                                        ) : (
                                          <span className="text-green-600 dark:text-green-400 font-bold">
                                            ₹0.00
                                          </span>
                                        )}
                                      </div>
                                      {paid > 0 && (
                                        <div>
                                          ✅ <strong>Already Paid:</strong> ₹
                                          {paid.toLocaleString("en-IN", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-green-800 dark:text-green-200">
                      {users.find((user) => user._id === selectedUser)?.name}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1 text-sm">
                      <span className="text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
                        ID:{" "}
                        {users.find((user) => user._id === selectedUser)?.pgId}
                      </span>
                      <span className="text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
                        Room:{" "}
                        {(() => {
                          const user = users.find(
                            (user) => user._id === selectedUser
                          );
                          if (user?.roomId && typeof user.roomId === "object") {
                            return user.roomId.roomNumber;
                          }
                          return "Not Assigned";
                        })()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUser("");
                      setSearchTerm("");
                    }}
                    className="text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Change Selection
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  setAmount(value === "" ? "" : Number(value));
                }}
                min="0"
                step="100"
                className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                required
              />
            </div>

            {/* Month selection */}
            <div>
              <label
                htmlFor="months"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Months <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select months:
                </p>
                {checkingPayments && (
                  <div className="mb-2 text-sm text-blue-600 dark:text-blue-400">
                    Checking existing payments...
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {availableMonths.map((m) => {
                    const hasExistingPayment = existingPayments.includes(m);
                    return (
                      <div key={m} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`month-${m}`}
                          checked={months.includes(m)}
                          onChange={() => handleMonthSelection(m)}
                          disabled={hasExistingPayment}
                          className={`h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded ${
                            hasExistingPayment
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        />
                        <label
                          htmlFor={`month-${m}`}
                          className={`ml-2 block text-sm ${
                            hasExistingPayment
                              ? "text-red-600 dark:text-red-400 line-through"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {m}
                          {hasExistingPayment && (
                            <span className="ml-1 text-xs text-red-500 dark:text-red-400">
                              (Already paid)
                            </span>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>
                {months.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Selected months: {months.join(", ")}
                  </div>
                )}
                {existingPayments.length > 0 && (
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ The following months already have payments:{" "}
                      {existingPayments.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Deposit payment toggle */}
          <div className="mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="depositPayment"
                checked={isDepositPayment}
                onChange={handleDepositToggle}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label
                htmlFor="depositPayment"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                This is a security deposit and booking payment
              </label>
            </div>
            {isDepositPayment && (
              <div className="mt-2 ml-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Note: This payment will be recorded as a security deposit and
                  will automatically approve the user&apos;s registration.
                </p>
              </div>
            )}
          </div>

          {/* Payment Date */}
          <div>
            <label
              htmlFor="paymentDate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Payment Date
            </label>
            <input
              type="date"
              id="paymentDate"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>

          {/* Due Date */}
          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
            >
              <option value="Paid">Paid</option>
              <option value="Due">Due</option>
              <option value="Partial">Partial</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label
              htmlFor="paymentMethod"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Payment Method
            </label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Card</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Transaction ID (only show for non-cash payment methods) */}
          {paymentMethod !== "Cash" && (
            <div>
              <label
                htmlFor="transactionId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Transaction ID
              </label>
              <input
                type="text"
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                placeholder="Enter transaction reference"
              />
            </div>
          )}

          {/* Remarks */}
          <div>
            <label
              htmlFor="remarks"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Remarks
            </label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              placeholder="Add any additional notes"
            />
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin/payments")}
              className="px-4 py-2 mr-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 dark:bg-pink-700 dark:hover:bg-pink-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Payment"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
