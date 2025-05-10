import mongoose, { Schema } from "mongoose";
import { IRoom } from "../interfaces/models";

const RoomSchema = new Schema<IRoom>(
  {
    building: {
      type: String,
      enum: ["A", "B"],
      required: [true, "Building identifier is required"],
    },
    roomNumber: {
      type: String,
      required: true,
    },
    floor: {
      type: Number,
      min: 1,
      max: 6,
      required: true,
    },
    type: {
      type: String,
      enum: ["2-sharing", "3-sharing"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    currentOccupancy: {
      type: Number,
      default: 0,
    },
    amenities: [String],
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance"],
      default: "available",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create a compound index for building, floor, and roomNumber to ensure uniqueness
RoomSchema.index({ building: 1, floor: 1, roomNumber: 1 }, { unique: true });

// Create a compound index for building and floor
RoomSchema.index({ building: 1, floor: 1 });

// Virtual field to get all residents in this room
RoomSchema.virtual("residents", {
  ref: "User",
  localField: "_id",
  foreignField: "roomId",
});

// Virtual field to calculate room availability
RoomSchema.virtual("isAvailable").get(function () {
  return this.currentOccupancy < this.capacity && this.status === "available";
});

// Virtual field to calculate vacancy count
RoomSchema.virtual("vacancyCount").get(function () {
  return this.capacity - this.currentOccupancy;
});

// Update room status based on occupancy
RoomSchema.pre("save", function (next) {
  if (this.isModified("currentOccupancy")) {
    // If room is full, mark as occupied
    if (this.currentOccupancy >= this.capacity) {
      this.status = "occupied";
    }
    // If room has space and is not in maintenance, mark as available
    else if (this.status !== "maintenance") {
      this.status = "available";
    }
  }
  next();
});

// Create model
const Room = mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);

export default Room;
