"use client";

import React, { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { SETTLEMENT_REASONS } from "@/app/lib/settlementConstants";

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettlementSuccess: () => void;
  user: {
    _id: string;
    name: string;
    pgId: string;
    dueAmount: number;
  };
  currentMonth: string; // e.g., "September 2025"
}

const SettlementModal: React.FC<SettlementModalProps> = ({
  isOpen,
  onClose,
  onSettlementSuccess,
  user,
  currentMonth,
}) => {
  const [formData, setFormData] = useState({
    amount: "",
    reason: "",
    remarks: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate amount
    const amount = parseFloat(formData.amount);
    if (!formData.amount.trim()) {
      newErrors.amount = "Settlement amount is required";
    } else if (isNaN(amount) || amount <= 0) {
      newErrors.amount = "Amount must be a positive number";
    } else if (amount > user.dueAmount) {
      newErrors.amount = `Amount cannot exceed due amount (₹${user.dueAmount})`;
    }

    // Validate reason
    if (!formData.reason) {
      newErrors.reason = "Reason is required";
    }

    // Validate remarks length
    if (formData.remarks && formData.remarks.length > 500) {
      newErrors.remarks = "Remarks cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/users/${user._id}/settle-due`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month: currentMonth,
          amount: parseFloat(formData.amount),
          reason: formData.reason,
          remarks: formData.remarks.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(
          `Successfully settled ₹${formData.amount} for ${user.name}`
        );

        // Reset form
        setFormData({ amount: "", reason: "", remarks: "" });
        onSettlementSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to settle due amount");

        if (data.maxSettlableAmount !== undefined) {
          setErrors({
            amount: `Maximum settleable amount: ₹${data.maxSettlableAmount}`,
          });
        }
      }
    } catch (error) {
      console.error("Settlement error:", error);
      toast.error("Failed to settle due amount. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ amount: "", reason: "", remarks: "" });
      setErrors({});
      onClose();
    }
  };

  const handleAmountSelect = (percentage: number) => {
    const amount = Math.round((user.dueAmount * percentage) / 100);
    setFormData((prev) => ({ ...prev, amount: amount.toString() }));
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Settle Due Amount
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* User Info */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-900 dark:text-white">
              {user.name}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ID: {user.pgId}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Due for {currentMonth}:
            </span>
            <span className="font-semibold text-red-600 dark:text-red-400">
              ₹{user.dueAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Settlement Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Settlement Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                ₹
              </span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0"
                min="0.01"
                max={user.dueAmount}
                step="0.01"
                disabled={isSubmitting}
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.amount ? "border-red-300" : "border-gray-300"
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}

            {/* Quick Amount Selection */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleAmountSelect(25)}
                disabled={isSubmitting}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 rounded disabled:opacity-50"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => handleAmountSelect(50)}
                disabled={isSubmitting}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 rounded disabled:opacity-50"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => handleAmountSelect(75)}
                disabled={isSubmitting}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 rounded disabled:opacity-50"
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => handleAmountSelect(100)}
                disabled={isSubmitting}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 rounded disabled:opacity-50"
              >
                Full
              </button>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason *
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.reason ? "border-red-300" : "border-gray-300"
              }`}
            >
              <option value="">Select a reason</option>
              {SETTLEMENT_REASONS.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
            {errors.reason && (
              <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Remarks (Optional)
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              placeholder="Additional notes or comments..."
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.remarks ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.remarks && (
              <p className="text-red-500 text-xs mt-1">{errors.remarks}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.remarks.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="flex items-center">
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
                  Settling...
                </div>
              ) : (
                "Settle Due"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettlementModal;
