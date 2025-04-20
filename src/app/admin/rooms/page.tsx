"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

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
  residents?: {
    _id: string;
    isOnNoticePeriod: boolean;
  }[];
  hasResidentsOnNotice?: boolean;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterFloor, setFilterFloor] = useState("all");
  const [floors, setFloors] = useState<string[]>([]);

  // Fetch rooms data
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/rooms?includeResidents=true");
        const roomsData = response.data.rooms || [];

        console.log("API Response:", roomsData);

        if (!roomsData.length) {
          console.error("No rooms data received from API");
          setError("No rooms data available");
          setLoading(false);
          return;
        }

        // Process rooms to check for residents on notice
        const processedRooms = roomsData.map((room: Room) => {
          const hasResidentsOnNotice = room.residents?.some(
            (resident) => resident.isOnNoticePeriod
          );

          return {
            ...room,
            hasResidentsOnNotice,
            floor: room.floor || "unknown",
          };
        });

        console.log("Processed Rooms:", processedRooms);

        // Extract unique floors with proper type assertion
        const uniqueFloors = Array.from(
          new Set(
            processedRooms.map((room: Room) => room.floor).filter(Boolean)
          )
        ) as string[];

        console.log("Unique Floors before sorting:", uniqueFloors);

        // Sort floors in a logical order
        const sortedFloors = uniqueFloors.sort((a, b) => {
          const floorOrder = {
            ground: 0,
            first: 1,
            second: 2,
            third: 3,
            fourth: 4,
            fifth: 5,
            sixth: 6,
            unknown: 999,
          };

          const aOrder =
            floorOrder[a as keyof typeof floorOrder] ??
            (isNaN(Number(a)) ? 998 : Number(a) + 10);
          const bOrder =
            floorOrder[b as keyof typeof floorOrder] ??
            (isNaN(Number(b)) ? 998 : Number(b) + 10);

          return aOrder - bOrder;
        });

        console.log("Sorted Floors:", sortedFloors);

        setRooms(processedRooms);
        setFilteredRooms(processedRooms);
        setFloors(sortedFloors);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError("Failed to load rooms data");
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Filter rooms based on search and filter criteria
  useEffect(() => {
    let result = rooms;

    if (searchTerm) {
      result = result.filter(
        (room) =>
          room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (room.floor &&
            typeof room.floor === "string" &&
            room.floor.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((room) => room.status === filterStatus);
    }

    if (filterType !== "all") {
      result = result.filter((room) => room.type === filterType);
    }

    if (filterFloor !== "all") {
      result = result.filter(
        (room) => String(room.floor) === String(filterFloor)
      );
    }

    console.log("Filtered Rooms:", result.length, "Filter Floor:", filterFloor);
    setFilteredRooms(result);
  }, [searchTerm, filterStatus, filterType, filterFloor, rooms]);

  // Group rooms by floor
  const getRoomsByFloor = (floor: string) => {
    console.log(`Checking for floor ${floor}, type: ${typeof floor}`);
    // Need to check against both string and number versions of floor
    return filteredRooms.filter((room) => {
      console.log(
        `Room ${room.roomNumber} floor: ${room.floor}, type: ${typeof room.floor}`
      );
      return String(room.floor) === String(floor);
    });
  };

  // Helper function to render a room cell
  const renderRoomCell = (room: Room) => {
    return (
      <Link
        key={room._id}
        href={`/admin/rooms/${room._id}`}
        className={`border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-shadow duration-200 relative overflow-hidden rounded-lg
          ${
            room.status === "available"
              ? "bg-green-50 dark:bg-green-900/20"
              : room.status === "occupied"
                ? room.hasResidentsOnNotice
                  ? "bg-gradient-to-br from-blue-50 to-orange-50 dark:from-blue-900/20 dark:to-orange-900/20"
                  : "bg-blue-50 dark:bg-blue-900/20"
                : "bg-yellow-50 dark:bg-yellow-900/20"
          }`}
      >
        <div className="font-bold text-lg text-center">{room.roomNumber}</div>
        <div className="text-xs text-center mt-1">{room.type}</div>
        <div className="flex justify-center mt-2">
          <span
            className={`px-2 py-0.5 rounded-full text-xs
              ${
                room.status === "available"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : room.status === "occupied"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              }`}
          >
            {room.status}
          </span>
          {room.hasResidentsOnNotice && (
            <span className="px-2 py-0.5 rounded-full text-xs ml-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              Notice
            </span>
          )}
        </div>

        <div className="mt-2 text-xs text-center">
          {room.currentOccupancy}/{room.capacity}
        </div>

        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 mt-1">
          <div
            className={`h-1 ${
              room.hasResidentsOnNotice
                ? "bg-gradient-to-r from-blue-500 to-orange-500"
                : "bg-gradient-to-r from-pink-500 to-purple-600"
            }`}
            style={{
              width: `${(room.currentOccupancy / room.capacity) * 100}%`,
            }}
          ></div>
        </div>
      </Link>
    );
  };

  // Get floor name for display
  const getFloorDisplayName = (floor: string) => {
    // Make sure floor is a string
    const floorStr = String(floor);
    console.log("Getting display name for floor:", floorStr);

    switch (floorStr) {
      case "1":
      case "first":
        return "First Floor";
      case "2":
      case "second":
        return "Second Floor";
      case "3":
      case "third":
        return "Third Floor";
      case "4":
      case "fourth":
        return "Fourth Floor";
      case "5":
      case "fifth":
        return "Fifth Floor";
      case "6":
      case "sixth":
        return "Sixth Floor";
      case "unknown":
        return "Unknown Floor";
      default:
        // If it's a number, add the appropriate suffix
        if (!isNaN(Number(floorStr))) {
          const num = Number(floorStr);
          let suffix = "th";
          if (num % 10 === 1 && num % 100 !== 11) suffix = "st";
          if (num % 10 === 2 && num % 100 !== 12) suffix = "nd";
          if (num % 10 === 3 && num % 100 !== 13) suffix = "rd";
          return `${num}${suffix} Floor`;
        }

        return floorStr.charAt(0).toUpperCase() + floorStr.slice(1) + " Floor";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
          Rooms Management
        </h1>
      </div>

      {/* Room Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-4 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Rooms
          </h3>
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            {rooms.length}
          </p>
        </div>
        <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-4 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Available
          </h3>
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-600">
            {rooms.filter((room) => room.status === "available").length}
          </p>
        </div>
        <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-4 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Occupied
          </h3>
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
            {rooms.filter((room) => room.status === "occupied").length}
          </p>
        </div>
        <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-4 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Under Maintenance
          </h3>
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600">
            {rooms.filter((room) => room.status === "maintenance").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-6 mb-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 dark:bg-gray-800/50"
              placeholder="Room number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 dark:bg-gray-800/50"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {/* Type filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Room Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 dark:bg-gray-800/50"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
              <option value="quad">Quad</option>
            </select>
          </div>

          {/* Floor filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Floor
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 dark:bg-gray-800/50"
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value)}
            >
              <option value="all">All Floors</option>
              {floors.map((floor) => (
                <option key={floor} value={floor}>
                  {getFloorDisplayName(floor)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rooms grouped by floor */}
      <div className="space-y-8">
        {/* Add debug info for troubleshooting */}
        <div className="hidden">
          <pre>filteredRooms: {filteredRooms.length}</pre>
          <pre>floors: {JSON.stringify(floors)}</pre>
          <pre>filterFloor: {filterFloor}</pre>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-8 border border-white/20 dark:border-gray-700/30 shadow-lg text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              No rooms found matching the criteria
            </p>
          </div>
        ) : filterFloor !== "all" ? (
          // Display only selected floor
          <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {getFloorDisplayName(filterFloor)}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredRooms.map((room) => renderRoomCell(room))}
            </div>
          </div>
        ) : (
          // Show rooms grouped by floors when "All Floors" is selected
          <>
            {floors.length > 0 ? (
              floors.map((floor) => {
                if (!floor) return null;

                const floorRooms = getRoomsByFloor(floor);
                console.log(`Floor: ${floor}, Rooms: ${floorRooms.length}`);

                if (floorRooms.length === 0) {
                  return null;
                }

                return (
                  <div
                    key={floor}
                    className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg"
                  >
                    <h2 className="text-xl font-semibold mb-4">
                      {getFloorDisplayName(floor)}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {floorRooms.map((room) => renderRoomCell(room))}
                    </div>
                  </div>
                );
              })
            ) : (
              // Fallback if no floors are detected
              <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
                <h2 className="text-xl font-semibold mb-4">All Rooms</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredRooms.map((room) => renderRoomCell(room))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Room Legend */}
        <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Legend</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-50 dark:bg-green-900/20 border border-gray-200 dark:border-gray-700 mr-2 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-50 dark:bg-blue-900/20 border border-gray-200 dark:border-gray-700 mr-2 rounded"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-yellow-50 dark:bg-yellow-900/20 border border-gray-200 dark:border-gray-700 mr-2 rounded"></div>
              <span>Maintenance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
