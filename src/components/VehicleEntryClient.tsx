"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaCar, FaDoorOpen, FaIdCard } from "react-icons/fa";
import VehicleNumberForm from "@/components/VehicleNumberForm";

export interface VehicleEntryUser {
  _id: string;
  name: string;
  pgId?: string;
  vehicleNumber?: string;
  roomId?:
    | {
        roomNumber: string;
      }
    | string
    | null;
}

interface VehicleEntryClientProps {
  initialUser: VehicleEntryUser;
}

export default function VehicleEntryClient({
  initialUser,
}: VehicleEntryClientProps) {
  const [user, setUser] = useState(initialUser);

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="rounded-2xl border border-white/20 dark:border-gray-700/30 bg-white/70 dark:bg-gray-800/60 p-6 shadow-xl backdrop-blur-lg">
        <div className="mb-6 flex items-start gap-4">
          <div className="rounded-full bg-pink-100 p-4 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300">
            <FaCar className="text-3xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vehicle Entry
            </p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Add your vehicle number
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              This will be saved directly with your existing PG profile.
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400">Resident</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {user.name}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400">Details</p>
            <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="inline-flex items-center">
                <FaIdCard className="mr-1 text-pink-500" />
                {user.pgId || "No PG ID"}
              </span>
              <span className="inline-flex items-center">
                <FaDoorOpen className="mr-1 text-purple-500" />
                Room{" "}
                {typeof user.roomId === "object" && user.roomId?.roomNumber
                  ? user.roomId.roomNumber
                  : "Not Assigned"}
              </span>
            </div>
          </div>
        </div>

        <VehicleNumberForm
          initialVehicleNumber={user.vehicleNumber || ""}
          onSaved={(vehicleNumber) =>
            setUser((current) => ({ ...current, vehicleNumber }))
          }
        />

        <div className="mt-6 text-center">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-pink-600 hover:text-pink-700 dark:text-pink-300"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
