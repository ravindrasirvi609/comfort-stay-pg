"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

interface Resident {
  _id: string;
  name: string;
  email: string;
  phone: string;
  pgId: string;
  roomId: string;
  roomNumber: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  joinDate: string;
  status: string;
  profilePic?: string;
}

interface Room {
  _id: string;
  roomNumber: string;
}

export default function ResidentsPage() {
  const searchParams = useSearchParams();
  const roomIdParam = searchParams?.get("roomId");

  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRoom, setFilterRoom] = useState(roomIdParam || "all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [residentsPerPage] = useState(10);
  const [selectedResident, setSelectedResident] = useState<string | null>(null);

  // Fetch residents data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch residents
        const residentsResponse = await axios.get("/api/residents");
        setResidents(residentsResponse.data.residents || []);

        // Fetch rooms for filtering
        const roomsResponse = await axios.get("/api/rooms");
        setRooms(roomsResponse.data.rooms || []);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load residents data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter residents based on search and filter criteria
  useEffect(() => {
    let result = residents;

    if (searchTerm) {
      result = result.filter(
        (resident) =>
          resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resident.pgId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resident.roomNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          resident.phone.includes(searchTerm)
      );
    }

    if (filterRoom !== "all") {
      result = result.filter((resident) => resident.roomId === filterRoom);
    }

    if (filterStatus !== "all") {
      result = result.filter((resident) => resident.status === filterStatus);
    }

    setFilteredResidents(result);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, filterRoom, filterStatus, residents]);

  // Set the roomId filter if it's provided in URL
  useEffect(() => {
    if (roomIdParam) {
      setFilterRoom(roomIdParam);
    }
  }, [roomIdParam]);

  // Pagination logic
  const indexOfLastResident = currentPage * residentsPerPage;
  const indexOfFirstResident = indexOfLastResident - residentsPerPage;
  const currentResidents = filteredResidents.slice(
    indexOfFirstResident,
    indexOfLastResident
  );
  const totalPages = Math.ceil(filteredResidents.length / residentsPerPage);

  const handleStatusChange = async (residentId: string, newStatus: string) => {
    try {
      const response = await axios.patch(`/api/residents/${residentId}`, {
        status: newStatus,
      });

      if (response.data.success) {
        // Update local state
        setResidents(
          residents.map((resident) =>
            resident._id === residentId
              ? { ...resident, status: newStatus }
              : resident
          )
        );
      }
    } catch (err) {
      console.error("Error updating resident status:", err);
      setError("Failed to update resident status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
          Residents Management
        </h1>
        <Link
          href="/admin/residents/add"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-300"
        >
          Add New Resident
        </Link>
      </div>

      {error && (
        <div
          className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Resident Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-4 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Residents
          </h3>
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            {residents.length}
          </p>
        </div>
        <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-4 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Active
          </h3>
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-600">
            {
              residents.filter((resident) => resident.status === "active")
                .length
            }
          </p>
        </div>
        <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-4 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Pending
          </h3>
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600">
            {
              residents.filter((resident) => resident.status === "pending")
                .length
            }
          </p>
        </div>
        <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-4 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Inactive
          </h3>
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-600">
            {
              residents.filter((resident) => resident.status === "inactive")
                .length
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-6 mb-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 dark:bg-gray-800/50"
              placeholder="Name, PG ID, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Room filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Room
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 dark:bg-gray-800/50"
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
            >
              <option value="all">All Rooms</option>
              {rooms.map((room) => (
                <option key={room._id} value={room._id}>
                  Room {room.roomNumber}
                </option>
              ))}
            </select>
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
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Residents Table */}
      <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-6 mb-6 border border-white/20 dark:border-gray-700/30 shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Resident
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                PG ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Room
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Phone
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Join Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-gray-200 dark:divide-gray-700">
            {currentResidents.map((resident) => (
              <tr
                key={resident._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {resident.profilePic ? (
                      <Image
                        className="h-10 w-10 rounded-full object-cover"
                        src={resident.profilePic}
                        alt=""
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white">
                        {resident.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {resident.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {resident.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {resident.pgId}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/admin/rooms/${resident.roomId}`}
                    className="text-sm text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    {resident.roomNumber}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {resident.phone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      resident.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                        : resident.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                    }`}
                  >
                    {resident.status.charAt(0).toUpperCase() +
                      resident.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {new Date(resident.joinDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        setSelectedResident(
                          selectedResident === resident._id
                            ? null
                            : resident._id
                        )
                      }
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </button>
                    {selectedResident === resident._id && (
                      <div className="absolute z-10 right-20 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5">
                        <div
                          className="py-1"
                          role="menu"
                          aria-orientation="vertical"
                        >
                          <Link
                            href={`/admin/residents/${resident._id}`}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            role="menuitem"
                          >
                            View Details
                          </Link>
                          <Link
                            href={`/admin/residents/edit/${resident._id}`}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            role="menuitem"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              handleStatusChange(
                                resident._id,
                                resident.status === "active"
                                  ? "inactive"
                                  : "active"
                              );
                              setSelectedResident(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            role="menuitem"
                          >
                            {resident.status === "active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {currentResidents.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No residents found matching the criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredResidents.length > 0 && (
        <div className="flex items-center justify-between bg-white/40 dark:bg-gray-800/30 px-4 py-3 rounded-xl border border-white/20 dark:border-gray-700/30">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-gray-800/70 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-gray-800/70 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{" "}
                <span className="font-medium">
                  {filteredResidents.length > 0 ? indexOfFirstResident + 1 : 0}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastResident, filteredResidents.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredResidents.length}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {Array.from({ length: Math.min(5, totalPages) }).map(
                  (_, index) => {
                    const pageNumber =
                      currentPage <= 3
                        ? index + 1
                        : currentPage >= totalPages - 2
                          ? totalPages - 4 + index
                          : currentPage - 2 + index;

                    if (pageNumber > 0 && pageNumber <= totalPages) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            currentPage === pageNumber
                              ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-500 dark:border-purple-600"
                              : "bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                          } text-sm font-medium`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    return null;
                  }
                )}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
