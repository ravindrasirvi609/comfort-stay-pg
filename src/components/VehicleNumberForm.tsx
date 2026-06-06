"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaCar } from "react-icons/fa";

interface VehicleNumberFormProps {
  initialVehicleNumber?: string;
  onSaved?: (vehicleNumber: string) => void;
}

const normalizeVehicleNumber = (value: string) =>
  value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

export default function VehicleNumberForm({
  initialVehicleNumber = "",
  onSaved,
}: VehicleNumberFormProps) {
  const [vehicleNumber, setVehicleNumber] = useState(initialVehicleNumber);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setVehicleNumber(initialVehicleNumber);
  }, [initialVehicleNumber]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const normalizedVehicleNumber = normalizeVehicleNumber(vehicleNumber);

    if (!normalizedVehicleNumber) {
      setError("Please enter your vehicle number.");
      return;
    }

    if (
      normalizedVehicleNumber.length < 6 ||
      normalizedVehicleNumber.length > 15
    ) {
      setError("Please enter a valid vehicle number.");
      return;
    }

    try {
      setSaving(true);
      const response = await axios.put("/api/users/vehicle", {
        vehicleNumber: normalizedVehicleNumber,
      });

      if (response.data.success) {
        setVehicleNumber(response.data.vehicleNumber);
        onSaved?.(response.data.vehicleNumber);
        toast.success("Vehicle number updated successfully");
      } else {
        setError(response.data.message || "Failed to update vehicle number.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Failed to update vehicle number."
        );
      } else {
        setError("Failed to update vehicle number.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="vehicleNumber"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Vehicle Number
        </label>
        <div className="relative">
          <FaCar className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500" />
          <input
            id="vehicleNumber"
            type="text"
            value={vehicleNumber}
            onChange={(event) =>
              setVehicleNumber(normalizeVehicleNumber(event.target.value))
            }
            placeholder="MH12AB1234"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/40 pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:border-pink-500 focus:ring-pink-500"
            autoComplete="off"
            maxLength={15}
            required
          />
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Spaces and dashes will be removed automatically.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-pink-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving
          ? "Saving..."
          : initialVehicleNumber
            ? "Update Vehicle Number"
            : "Save Vehicle Number"}
      </button>
    </form>
  );
}
