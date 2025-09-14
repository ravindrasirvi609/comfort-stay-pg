import User from "../api/models/User";
import Room from "../api/models/Room";

/**
 * Validates and finds an available bed in a room
 * @param roomId - The room ID to check
 * @param excludeUserId - Optional user ID to exclude from occupied beds check (for updates)
 * @returns Promise<{isValid: boolean, bedNumber?: number, message?: string}>
 */
export async function validateAndFindAvailableBed(
  roomId: string,
  excludeUserId?: string
): Promise<{ isValid: boolean; bedNumber?: number; message?: string }> {
  try {
    // Get the room
    const room = await Room.findById(roomId);
    if (!room) {
      return { isValid: false, message: "Room not found" };
    }

    // Check if room has space (we'll double-check this after calculating occupied beds)
    // if (room.currentOccupancy >= room.capacity) {
    //   return { isValid: false, message: "Room is already fully occupied" };
    // }

    // Find occupied bed numbers, excluding the user being updated if specified
    const query: any = {
      roomId: room._id,
      isActive: true,
      isDeleted: { $ne: true },
    };

    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }

    const usersInRoom = await User.find(query).select("bedNumber name");
    const occupiedBedNumbers = usersInRoom
      .map((u: any) => u.bedNumber)
      .filter((bed: any) => bed !== null && bed !== undefined);

    // Debug logging
    // console.log(`Room ${room.roomNumber}: capacity=${room.capacity}, occupied beds: [${occupiedBedNumbers.join(', ')}]`);

    // Check for duplicate beds (this shouldn't happen but let's catch it)
    const uniqueOccupiedBeds = Array.from(new Set(occupiedBedNumbers));
    if (occupiedBedNumbers.length !== uniqueOccupiedBeds.length) {
      console.warn(
        `Duplicate bed assignments found in room ${room.roomNumber} (${room.building}):`,
        usersInRoom
      );
    }

    // Double-check if room has space based on actual occupied beds
    // This handles cases where currentOccupancy might be wrong due to duplicate assignments
    const occupiedBedCount = uniqueOccupiedBeds.length;
    if (occupiedBedCount >= room.capacity) {
      return { isValid: false, message: "Room is already fully occupied" };
    }

    // Find the first available bed
    let availableBedNumber = null;
    for (let i = 1; i <= room.capacity; i++) {
      if (!occupiedBedNumbers.includes(i)) {
        availableBedNumber = i;
        break;
      }
    }

    // console.log(`Available bed found: ${availableBedNumber}`);

    if (availableBedNumber === null) {
      return { isValid: false, message: "No available beds in this room" };
    }

    return { isValid: true, bedNumber: availableBedNumber };
  } catch (error) {
    console.error("Error validating bed availability:", error);
    return { isValid: false, message: "Error validating bed availability" };
  }
}

/**
 * Validates if a specific bed number is available in a room
 * @param roomId - The room ID to check
 * @param bedNumber - The bed number to validate
 * @param excludeUserId - Optional user ID to exclude from occupied beds check
 * @returns Promise<{isValid: boolean, message?: string}>
 */
export async function validateSpecificBed(
  roomId: string,
  bedNumber: number,
  excludeUserId?: string
): Promise<{ isValid: boolean; message?: string }> {
  try {
    // Validate bed number range
    const room = await Room.findById(roomId);
    if (!room) {
      return { isValid: false, message: "Room not found" };
    }

    if (bedNumber < 1 || bedNumber > room.capacity) {
      return {
        isValid: false,
        message: `Bed number must be between 1 and ${room.capacity}`,
      };
    }

    // Check if bed is already occupied
    const query: any = {
      roomId: room._id,
      bedNumber: bedNumber,
      isActive: true,
      isDeleted: { $ne: true },
    };

    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }

    const existingUser = await User.findOne(query).select("name");

    if (existingUser) {
      return {
        isValid: false,
        message: `Bed ${bedNumber} is already occupied by ${existingUser.name}`,
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error("Error validating specific bed:", error);
    return { isValid: false, message: "Error validating bed assignment" };
  }
}
