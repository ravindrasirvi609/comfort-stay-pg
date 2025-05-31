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

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/users");

        if (response.data.success) {
          // Only include active users with assigned rooms
          const activeUsers = response.data.users.filter(
            (user: User) =>
              user.roomId &&
              typeof user.roomId === "object" &&
              user.roomId.roomNumber
          );
          setUsers(activeUsers);
          setFilteredUsers(activeUsers);
        } else {
          setError("Failed to load users");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users");
        setLoading(false);
      }
    };

    fetchUsers();
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
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

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

  // Handle deposit payment toggle
  const handleDepositToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setIsDepositPayment(isChecked);
    if (isChecked) {
      setStatus("Paid"); // Auto-set status to Paid for deposit payments
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser || !amount || months.length === 0 || !dueDate) {
      setError("Please fill in all required fields");
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
          <div>
            <label
              htmlFor="user"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Resident <span className="text-red-500">*</span>
            </label>
            <div className="mb-2">
              <input
                type="text"
                placeholder="Search by name, PG ID or room"
                className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md mb-2">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className={`p-3 cursor-pointer transition-colors duration-150 ${
                      selectedUser === user._id
                        ? "bg-pink-50 dark:bg-pink-900/30 border-l-4 border-pink-500"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-4 border-transparent"
                    }`}
                    onClick={() => setSelectedUser(user._id)}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </div>
                    <div className="flex text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className="mr-3">ID: {user.pgId}</span>
                      <span>
                        Room:{" "}
                        {typeof user.roomId === "object" &&
                        user.roomId?.roomNumber
                          ? user.roomId.roomNumber
                          : "Not Assigned"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {selectedUser && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Selected resident:{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {users.find((user) => user._id === selectedUser)?.name}
                </span>
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {availableMonths.map((m) => (
                    <div key={m} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`month-${m}`}
                        checked={months.includes(m)}
                        onChange={() => handleMonthSelection(m)}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`month-${m}`}
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        {m}
                      </label>
                    </div>
                  ))}
                </div>
                {months.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Selected months: {months.join(", ")}
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
