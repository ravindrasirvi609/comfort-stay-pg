"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  FaBed,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaIdCard,
} from "react-icons/fa";
import Link from "next/link";

interface User {
  _id: string;
  name: string;
  email: string;
  pgId: string;
  phone: string;
  bedNumber: number;
  moveInDate: string;
  isOnNoticePeriod: boolean;
  lastStayingDate?: string;
}

interface Bed {
  bedNumber: number;
  isOccupied: boolean;
  resident: User | null;
}

interface Room {
  _id: string;
  building: "A" | "B";
  roomNumber: string;
  status: string;
  type: string;
  price: number;
  capacity: number;
  currentOccupancy: number;
  floor: number;
  amenities: string[];
  isActive: boolean;
  createdAt: string;
  beds: Bed[];
}

export default function RoomDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/rooms/${id}`);

        if (response.data.success) {
          setRoom(response.data.room);
        } else {
          setError("Failed to load room data");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching room details:", err);
        setError("Failed to load room data");
        setLoading(false);
      }
    };

    if (id) {
      fetchRoomDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="text-red-500 text-xl mb-4">
          {error || "Room not found"}
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Function to format date with proper handling of null/undefined values
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderBed = (bedNumber: number) => {
    const assignment = room?.beds.find((a) => a.bedNumber === bedNumber);

    // Check if the resident is on notice period
    const isOnNoticePeriod = assignment?.resident?.isOnNoticePeriod;

    return (
      <div
        key={`bed-${bedNumber}`}
        className={`border rounded-lg p-4 ${
          assignment?.isOccupied
            ? isOnNoticePeriod
              ? "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-800" // Notice period styling
              : "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-800"
            : "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-800"
        }`}
      >
        <div className="font-semibold mb-2 flex justify-between items-center">
          <span>Bed #{bedNumber}</span>
          {isOnNoticePeriod && (
            <span className="bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs px-2 py-1 rounded-full">
              On Notice
            </span>
          )}
        </div>

        {assignment?.isOccupied && assignment.resident ? (
          <div>
            <Link
              href={`/admin/users/${assignment.resident._id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {assignment.resident.name}
            </Link>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {assignment.resident.email}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              PG ID: {assignment.resident.pgId}
            </div>
            {isOnNoticePeriod && assignment.resident.lastStayingDate && (
              <div className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                Leaving on:{" "}
                {new Date(
                  assignment.resident.lastStayingDate
                ).toLocaleDateString()}
              </div>
            )}
          </div>
        ) : (
          <div className="text-green-600 dark:text-green-400">Available</div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="flex items-center text-purple-600 hover:text-purple-800 transition duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Rooms
        </button>
      </div>

      <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Building {room.building} - Room {room.roomNumber}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Floor: {room.floor} | Type:{" "}
                {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
              </p>
            </div>
            <span
              className={`px-3 py-1 text-sm rounded-full font-semibold ${
                room.status === "available"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                  : room.status === "occupied"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
              }`}
            >
              {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Room Details
              </h2>

              <div className="space-y-4">
                <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-xl p-4 border border-white/20 dark:border-gray-700/30">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Occupancy
                  </h3>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300">
                      Current
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {room.currentOccupancy}/{room.capacity}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
                      style={{
                        width: `${(room.currentOccupancy / room.capacity) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-xl p-4 border border-white/20 dark:border-gray-700/30">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-block px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-xl p-4 border border-white/20 dark:border-gray-700/30">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Room Created
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {formatDate(room.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Bed Allocation
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {room.beds && room.beds.map((bed) => renderBed(bed.bedNumber))}
              </div>

              <div className="flex gap-4 mt-8">
                <Link
                  href={`/admin/rooms/edit/${room._id}`}
                  className="inline-flex items-center py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition duration-300 shadow-md"
                >
                  Edit Room Details
                </Link>

                <Link
                  href={`/admin/residents?roomId=${room._id}`}
                  className="inline-flex items-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition duration-300 shadow-md"
                >
                  Manage Residents
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
