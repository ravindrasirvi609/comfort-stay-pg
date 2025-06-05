import React, { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/hooks/useToast";

interface Room {
  _id: string;
  roomNumber: string;
  type: string;
  price: number;
  currentOccupancy: number;
  capacity: number;
  building: string;
}

interface AdminRoomChangeProps {
  userId: string;
  currentRoomId?: string;
  onRoomChanged: () => void;
}

const AdminRoomChange: React.FC<AdminRoomChangeProps> = ({
  userId,
  currentRoomId,
  onRoomChanged,
}) => {
  const { toast } = useToast();
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableRooms();
  }, []);

  const fetchAvailableRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/api/rooms");

      if (response.data.success) {
        // Filter rooms that have available space
        const availableRooms = response.data.rooms.filter(
          (room: Room) => room.currentOccupancy < room.capacity
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

  const handleRoomChange = async () => {
    if (!selectedRoomId) {
      toast.error("Please select a room");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await axios.post("/api/users/room-change", {
        userId: userId,
        newRoomId: selectedRoomId,
      });

      if (response.data.success) {
        toast.success("Room changed successfully");
        onRoomChanged();
        // Reset selection
        setSelectedRoomId("");
      } else {
        toast.error(response.data.message || "Failed to change room");
      }
    } catch (err: any) {
      console.error("Error changing room:", err);
      toast.error(
        err.response?.data?.message || "An error occurred while changing room"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Change Room
        </h2>
      </div>
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : availableRooms.length === 0 ? (
          <div className="p-3 text-sm text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-md">
            No available rooms found. All rooms are either full or unavailable.
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="roomId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Select New Room
              </label>
              <select
                id="roomId"
                name="roomId"
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                disabled={submitting}
              >
                <option value="">Select a room</option>
                {availableRooms.map((room) => {
                  const isBuildingA = room.building === "A";
                  const isBuildingB = room.building === "B";
                  return (
                    <option
                      key={room._id}
                      value={room._id}
                      disabled={room._id === currentRoomId}
                      className={`${
                        isBuildingA
                          ? "bg-blue-100 dark:bg-blue-900"
                          : isBuildingB
                            ? "bg-green-100 dark:bg-green-900"
                            : ""
                      }`}
                    >
                      Room {room.roomNumber} - {room.type} (₹{room.price}) -
                      {room.currentOccupancy}/{room.capacity} occupied
                      {room._id === currentRoomId ? " (Current)" : ""}
                    </option>
                  );
                })}
              </select>
              {selectedRoomId && (
                <div className="mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Building:
                    </span>
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${
                        availableRooms.find((r) => r._id === selectedRoomId)
                          ?.building === "A"
                          ? "bg-blue-500"
                          : availableRooms.find((r) => r._id === selectedRoomId)
                                ?.building === "B"
                            ? "bg-green-500"
                            : "bg-gray-500"
                      }`}
                    ></span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Building{" "}
                      {availableRooms.find((r) => r._id === selectedRoomId)
                        ?.building || "Other"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleRoomChange}
              disabled={submitting || !selectedRoomId}
              className={`w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                (submitting || !selectedRoomId) &&
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
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRoomChange;
