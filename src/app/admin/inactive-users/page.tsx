"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useToast } from "@/hooks/useToast";

interface Room {
  _id: string;
  roomNumber: string;
  type: string;
  price: number;
  capacity: number;
  currentOccupancy: number;
}

interface InactiveUser {
  _id: string;
  name: string;
  email: string;
  pgId: string;
  phone?: string;
  roomId?:
    | {
        _id: string;
        roomNumber: string;
        type: string;
        price: number;
      }
    | string
    | null;
  moveInDate?: string;
  moveOutDate?: string;
  isActive: boolean;
  createdAt: string;
  fathersName?: string;
  permanentAddress?: string;
  city?: string;
  state?: string;
}

export default function InactiveUsersPage() {
  const [users, setUsers] = useState<InactiveUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<InactiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [activationLoading, setActivationLoading] = useState<string | null>(
    null
  );
  const { toast } = useToast();
  const router = useRouter();

  // Modal state
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InactiveUser | null>(null);
  const [activateSuccess, setActivateSuccess] = useState(false);

  // Room assignment state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [formData, setFormData] = useState({
    roomId: "",
    roomNumber: "",
    checkInDate: format(new Date(), "yyyy-MM-dd"),
  });

  // Fetch inactive users data
  useEffect(() => {
    const fetchInactiveUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/users/inactive");

        if (response.data.success) {
          setUsers(response.data.users || []);
          setFilteredUsers(response.data.users || []);
        } else {
          setError(response.data.message || "Failed to load inactive users");
        }
      } catch (err) {
        console.error("Error fetching inactive users:", err);
        setError("Failed to load inactive users data");
      } finally {
        setLoading(false);
      }
    };

    fetchInactiveUsers();
  }, []);

  // Filter users based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.pgId &&
            user.pgId.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.phone && user.phone.includes(searchTerm))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, users]);

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Function to open activation modal
  const handleOpenActivateModal = async (user: InactiveUser) => {
    setSelectedUser(user);
    setError("");

    // Fetch available rooms
    try {
      setLoadingRooms(true);
      const response = await axios.get("/api/rooms?availableOnly=true");
      if (response.data.success) {
        setRooms(response.data.rooms || []);
      } else {
        toast.error("Failed to load available rooms");
      }
    } catch (err) {
      console.error("Error loading rooms:", err);
      toast.error("Failed to load available rooms");
    } finally {
      setLoadingRooms(false);
    }

    setShowActivateModal(true);
  };

  const closeActivateModal = () => {
    setShowActivateModal(false);
  };

  // Function to handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to handle room change
  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRoom = rooms.find((room) => room._id === e.target.value);
    setFormData((prev) => ({
      ...prev,
      roomId: e.target.value,
      roomNumber: selectedRoom ? selectedRoom.roomNumber : "",
    }));
  };

  // Function to handle activation
  const handleActivateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setActivationLoading(selectedUser._id);
      setError("");

      const response = await axios.put("/api/users/inactive", {
        userId: selectedUser._id,
        roomId: formData.roomId || undefined,
        checkInDate: formData.checkInDate,
      });

      if (response.data.success) {
        setActivateSuccess(true);
        // Update the users list by removing the activated user
        setUsers(users.filter((u) => u._id !== selectedUser._id));

        // Close modal after a short delay to show success state
        setTimeout(() => {
          setShowActivateModal(false);
          toast.success("User activated successfully!");
          setActivateSuccess(false);
        }, 1500);
      } else {
        setError(response.data.message || "Failed to activate user");
      }
    } catch (err: any) {
      console.error("Error activating user:", err);
      setError(err.response?.data?.message || "Failed to activate user");
    } finally {
      setActivationLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-pink-500 animate-spin"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/40 rounded-2xl p-6 mb-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                Inactive Users
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and reactivate users who have left but may return
              </p>
            </div>
          </div>
        </div>

        {/* Success message */}
        {activateSuccess && (
          <div
            className="mb-6 bg-green-100/80 dark:bg-green-900/30 backdrop-blur-sm border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl relative flex items-center"
            role="alert"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="block sm:inline text-sm">
              User activated successfully! The user can now login and use the
              system again.
            </span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            className="mb-6 bg-red-100/80 dark:bg-red-900/30 backdrop-blur-sm border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl relative flex items-center"
            role="alert"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="block sm:inline text-sm">{error}</span>
          </div>
        )}

        {/* Search bar */}
        <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-2xl p-6 mb-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                placeholder="Search by name, email, PG ID or phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Users table */}
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-900/30 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No inactive users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/30 dark:divide-gray-700/30">
                <thead className="bg-white/50 dark:bg-gray-800/50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      User
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
                      Previous Room
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Last Active Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/20 dark:bg-gray-900/20 divide-y divide-gray-200/30 dark:divide-gray-700/30">
                  {currentUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                              {user.name
                                ? user.name.charAt(0).toUpperCase()
                                : "U"}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {user.pgId || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.roomId && typeof user.roomId === "object" ? (
                          <div className="text-sm text-gray-900 dark:text-white">
                            {user.roomId.roomNumber} ({user.roomId.type})
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Not assigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.moveOutDate
                          ? new Date(user.moveOutDate).toLocaleDateString()
                          : "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenActivateModal(user)}
                          disabled={activationLoading === user._id}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-4 disabled:opacity-50"
                        >
                          {activationLoading === user._id ? (
                            <span>Processing...</span>
                          ) : (
                            <span>Activate</span>
                          )}
                        </button>
                        <Link
                          href={`/admin/users/${user._id}`}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white/50 dark:bg-gray-800/50 px-4 py-3 flex items-center justify-between border-t border-white/20 dark:border-gray-700/30 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-400">
                    Showing{" "}
                    <span className="font-medium">{indexOfFirstUser + 1}</span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastUser, filteredUsers.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{filteredUsers.length}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/70 disabled:opacity-50"
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

                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === idx + 1
                            ? "z-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-500 dark:border-purple-600"
                            : "bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/70"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/70 disabled:opacity-50"
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
      </div>

      {/* Activation Dialog - styled to match the registration confirmation dialog */}
      {showActivateModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Activate User - {selectedUser.name}
            </h3>

            <form onSubmit={handleActivateUser} className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Provide room assignment details to activate this user. Room
                  assignment is optional.
                </p>
              </div>

              {/* Error message in dialog */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4 mb-5">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400 dark:text-red-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-600 dark:text-red-500">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* User info summary */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">PG ID</p>
                    <p className="font-medium">
                      {selectedUser.pgId || "Not assigned"}
                    </p>
                  </div>
                  {selectedUser.phone && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium">{selectedUser.phone}</p>
                    </div>
                  )}
                  {selectedUser.city && selectedUser.state && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">
                        Location
                      </p>
                      <p className="font-medium">
                        {selectedUser.city}, {selectedUser.state}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Room selection */}
              <div>
                <label
                  htmlFor="roomId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Room Assignment
                </label>
                <select
                  id="roomId"
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleRoomChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm bg-white/70 dark:bg-gray-900/70 text-gray-900 dark:text-white"
                >
                  <option value="">Select Room (Optional)</option>
                  {loadingRooms ? (
                    <option disabled>Loading rooms...</option>
                  ) : (
                    rooms.map((room) => (
                      <option key={room._id} value={room._id}>
                        Room {room.roomNumber} - {room.type} (₹{room.price}
                        /month) - {room.currentOccupancy}/{room.capacity}{" "}
                        occupied
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Check-in date */}
              <div>
                <label
                  htmlFor="checkInDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Check-in Date
                </label>
                <input
                  type="date"
                  id="checkInDate"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm bg-white/70 dark:bg-gray-900/70 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <button
                  type="button"
                  onClick={closeActivateModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={activationLoading === selectedUser._id}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70"
                >
                  {activationLoading === selectedUser._id ? (
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
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Activate User
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
