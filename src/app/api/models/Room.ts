import mongoose, { Schema } from "mongoose";

const RoomSchema = new Schema({
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
});

export default mongoose.models.Room || mongoose.model("Room", RoomSchema);
