import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaExchangeAlt, FaDoorOpen, FaBed } from "react-icons/fa";

interface Room {
  _id: string;
  roomNumber: string;
  type: string;
  price: number;
  currentOccupancy: number;
  capacity: number;
}

interface RoomChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomChanged: (data: any) => void;
  currentRoomId?: string;
}

const RoomChangeDialog: React.FC<RoomChangeDialogProps> = ({
  isOpen,
  onClose,
  onRoomChanged,
  currentRoomId,
}) => {
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available rooms when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableRooms();
    }
  }, [isOpen]);

  const fetchAvailableRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/api/rooms");

      if (response.data.success) {
        // Filter rooms that have available space and are not the current room
        const availableRooms = response.data.rooms.filter(
          (room: Room) =>
            room.currentOccupancy < room.capacity && room._id !== currentRoomId
        );

        setAvailableRooms(availableRooms);
      } else {
        setError("Failed to load available rooms");
      }
    } catch (err) {
      console.error("Error fetching available rooms:", err);
      setError("Failed to load available rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleRoomChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRoomId) {
      setError("Please select a room");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await axios.post("/api/users/room-change", {
        newRoomId: selectedRoomId,
      });

      if (response.data.success) {
        onRoomChanged(response.data.data);
        onClose();
      } else {
        setError(response.data.message || "Failed to change room");
      }
    } catch (err: any) {
      console.error("Error changing room:", err);
      setError(
        err.response?.data?.message || "An error occurred while changing room"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>

        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 bg-white dark:bg-gray-800 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-pink-100 dark:bg-pink-800 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                <FaExchangeAlt className="w-6 h-6 text-pink-600 dark:text-pink-300" />
              </div>

              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  Request Room Change
                </h3>

                <div className="mt-4">
                  {error && (
                    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-md">
                      {error}
                    </div>
                  )}

                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-pink-600 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <form onSubmit={handleRoomChange}>
                      <div className="mb-4">
                        <label
                          htmlFor="roomId"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Select New Room
                        </label>

                        {availableRooms.length === 0 ? (
                          <div className="p-3 text-sm text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-md">
                            No available rooms found. All rooms are either full
                            or unavailable.
                          </div>
                        ) : (
                          <select
                            id="roomId"
                            name="roomId"
                            value={selectedRoomId}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
                            required
                          >
                            <option value="">Select a room</option>
                            {availableRooms.map((room) => (
                              <option key={room._id} value={room._id}>
                                Room {room.roomNumber} - {room.type} (₹
                                {room.price}) -{room.currentOccupancy}/
                                {room.capacity} occupied
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="mt-6 mb-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Important Information:
                        </h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <li>
                            Your bed assignment will be updated automatically
                          </li>
                          <li>
                            Monthly rent may change based on the new room type
                          </li>
                          <li>Room change is immediate upon approval</li>
                        </ul>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleRoomChange}
              disabled={submitting || availableRooms.length === 0}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-pink-600 text-base font-medium text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:ml-3 sm:w-auto sm:text-sm ${
                (submitting || availableRooms.length === 0) &&
                "opacity-50 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                "Change Room"
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomChangeDialog;
