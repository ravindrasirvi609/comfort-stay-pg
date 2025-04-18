import mongoose, { Schema } from "mongoose";
import { IRoomChangeRequest } from "../interfaces/models";

const RoomChangeRequestSchema = new Schema<IRoomChangeRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    oldRoomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    newRoomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    oldBedNumber: {
      type: Number,
      required: true,
    },
    newBedNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Completed", "Cancelled"],
      default: "Completed",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the model
const RoomChangeRequest =
  mongoose.models.RoomChangeRequest ||
  mongoose.model<IRoomChangeRequest>(
    "RoomChangeRequest",
    RoomChangeRequestSchema
  );

export default RoomChangeRequest;
