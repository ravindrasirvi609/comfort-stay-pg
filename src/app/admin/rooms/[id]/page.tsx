"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Room {
  _id: string;
  roomNumber: string;
  status: string;
  type: string;
  price: number;
  capacity: number;
  currentOccupancy: number;
  floor: string;
  amenities: string[];
  isActive: boolean;
  createdAt: string;
}

interface PageParams {
  id: string;
}

// Create a wrapper function to handle the params type issue
function useParams<T>(params: T | Promise<T>): T {
  if (params instanceof Promise) {
    return React.use(params);
  }
  return params;
}

export default function RoomDetailPage({
  params,
}: {
  params: PageParams | Promise<PageParams>;
}) {
  const router = useRouter();
  const unwrappedParams = useParams(params);
  const id = unwrappedParams.id;
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
                Room {room.roomNumber}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Room Details
              </h2>

              <div className="space-y-4">
                <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-xl p-4 border border-white/20 dark:border-gray-700/30">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Pricing
                  </h3>
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                    ₹{room.price}/month
                  </p>
                </div>

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
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Actions
              </h2>

              <div className="space-y-4">
                <Link
                  href={`/admin/rooms/edit/${room._id}`}
                  className="block w-full text-center py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition duration-300 shadow-md"
                >
                  Edit Room Details
                </Link>

                <Link
                  href={`/admin/residents?roomId=${room._id}`}
                  className="block w-full text-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition duration-300 shadow-md"
                >
                  Manage Residents
                </Link>
              </div>

              <div className="mt-6 backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-xl p-4 border border-white/20 dark:border-gray-700/30">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Room Created
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {new Date(room.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
