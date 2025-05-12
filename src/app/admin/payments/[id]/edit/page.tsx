"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { format } from "date-fns";
import {
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
} from "react-icons/fa";

// Define Payment interface
interface Payment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    pgId: string;
  };
  amount: number;
  months: string[];
  paymentDate: string;
  dueDate: string;
  paymentStatus: "Paid" | "Due" | "Overdue" | "Partial" | "Pending";
  receiptNumber?: string;
  paymentMethod: "Cash" | "UPI" | "Bank Transfer" | "Card" | "Other";
  transactionId?: string;
  remarks?: string;
  isActive: boolean;
  isDepositPayment: boolean;
}

export default function EditPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id as string;

  // States
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form states
  const [amount, setAmount] = useState<number>(0);
  const [months, setMonths] = useState<string[]>([]);
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [status, setStatus] = useState<
    "Paid" | "Due" | "Overdue" | "Partial" | "Pending"
  >("Paid");
  const [paymentMethod, setPaymentMethod] = useState<
    "Cash" | "UPI" | "Bank Transfer" | "Card" | "Other"
  >("Cash");
  const [transactionId, setTransactionId] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [isDepositPayment, setIsDepositPayment] = useState<boolean>(false);

  // Generate months array for selection
  const allMonths = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(new Date().getFullYear(), i, 1);
    return format(date, "MMMM yyyy");
  });

  // Years for month selection
  const currentYear = new Date().getFullYear();
  const prevYear = currentYear - 1;
  const nextYear = currentYear + 1;

  const allYears = [prevYear, currentYear, nextYear];

  // All month options
  const allMonthOptions = allYears.flatMap((year) => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(year, i, 1);
      return format(date, "MMMM yyyy");
    });
  });

  // Fetch payment data
  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/payments/${paymentId}`);

        if (response.data.success) {
          const paymentData = response.data.payment;
          setPayment(paymentData);

          // Set form states
          setAmount(paymentData.amount);
          setMonths(paymentData.months || []);
          setPaymentDate(
            paymentData.paymentDate
              ? format(new Date(paymentData.paymentDate), "yyyy-MM-dd")
              : ""
          );
          setDueDate(
            paymentData.dueDate
              ? format(new Date(paymentData.dueDate), "yyyy-MM-dd")
              : ""
          );
          setStatus(paymentData.paymentStatus);
          setPaymentMethod(paymentData.paymentMethod);
          setTransactionId(paymentData.transactionId || "");
          setRemarks(paymentData.remarks || "");
          setIsDepositPayment(paymentData.isDepositPayment || false);
        } else {
          setError("Failed to fetch payment data");
        }
      } catch (err) {
        console.error("Error fetching payment:", err);
        setError("Failed to fetch payment data");
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchPayment();
    }
  }, [paymentId]);

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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || months.length === 0 || !dueDate) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const paymentData = {
        amount: Number(amount),
        months,
        paymentDate,
        dueDate,
        paymentStatus: status,
        paymentMethod,
        transactionId: transactionId || undefined,
        remarks: remarks || undefined,
        isDepositPayment,
      };

      const response = await axios.put(
        `/api/payments/${paymentId}`,
        paymentData
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/payments");
        }, 2000);
      } else {
        setError(response.data.message || "Failed to update payment");
      }

      setSubmitting(false);
    } catch (err: unknown) {
      console.error("Error updating payment:", err);
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Failed to update payment"
          : "Failed to update payment"
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-pink-600" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md">
          <FaExclamationTriangle className="inline-block mr-2" />
          Payment not found or you don't have permission to edit it.
        </div>
        <div className="mt-4">
          <Link
            href="/admin/payments"
            className="text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300"
          >
            <FaArrowLeft className="inline-block mr-2" />
            Back to Payments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <Link
          href="/admin/payments"
          className="text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300 flex items-center text-sm mb-2"
        >
          <FaArrowLeft className="mr-1" /> Back to Payments
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 dark:from-pink-400 dark:to-purple-500">
          Edit Payment
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Update payment details for {payment.userId.name} (
          {payment.userId.pgId})
        </p>
      </div>

      {/* Success message */}
      {success && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded dark:bg-green-900/50 dark:border-green-800 dark:text-green-400 flex items-center">
          <FaCheckCircle className="mr-2" />
          <p>Payment updated successfully! Redirecting...</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900/50 dark:border-red-800 dark:text-red-400 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          <p>{error}</p>
        </div>
      )}

      {/* Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Amount (₹) *
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              placeholder="Enter payment amount"
            />
          </div>

          {/* Payment Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Payment Status *
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              required
              className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
            >
              <option value="Paid">Paid</option>
              <option value="Due">Due</option>
              <option value="Overdue">Overdue</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Payment Date */}
          <div>
            <label
              htmlFor="paymentDate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Payment Date *
            </label>
            <input
              type="date"
              id="paymentDate"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>

          {/* Due Date */}
          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Due Date *
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="bg-white/50 dark:bg-gray-900/50 focus:ring-pink-500 focus:border-pink-500 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label
              htmlFor="paymentMethod"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Payment Method *
            </label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              required
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

          {/* Is Deposit Payment */}
          <div className="flex items-center h-full">
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={isDepositPayment}
                onChange={(e) => setIsDepositPayment(e.target.checked)}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <span className="ml-2">This is a security deposit payment</span>
            </label>
          </div>
        </div>

        {/* Months Selection */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Months *
          </label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {allMonthOptions.map((month) => (
              <button
                key={month}
                type="button"
                onClick={() => handleMonthSelection(month)}
                className={`px-2 py-1 text-xs rounded-full focus:outline-none ${
                  months.includes(month)
                    ? "bg-pink-100 text-pink-800 border border-pink-300 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-800"
                    : "bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                }`}
              >
                {month}
              </button>
            ))}
          </div>
          {months.length === 0 && (
            <p className="text-red-500 text-xs mt-1">
              Please select at least one month
            </p>
          )}
        </div>

        {/* Remarks */}
        <div className="mt-6">
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
            placeholder="Any additional notes about this payment"
          ></textarea>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex justify-end space-x-3">
          <Link
            href="/admin/payments"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 dark:bg-pink-700 dark:hover:bg-pink-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 flex items-center"
          >
            {submitting ? <FaSpinner className="animate-spin mr-2" /> : null}
            {submitting ? "Updating..." : "Update Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}
