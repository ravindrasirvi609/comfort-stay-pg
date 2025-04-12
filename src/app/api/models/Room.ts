import mongoose, { Schema } from "mongoose";

const RoomSchema = new Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
    },
    floor: {
      type: Number,
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

// Create model
const Room = mongoose.models.Room || mongoose.model("Room", RoomSchema);

export default Room;
