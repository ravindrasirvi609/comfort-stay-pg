import mongoose, { Schema } from "mongoose";
import { INotification } from "../interfaces/models";

const NotificationSchema = new Schema<INotification>(
  {
    // User relationship
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Notification details
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Payment", "Complaint", "RoomChange", "System", "Email", "Other"],
      default: "System",
    },

    // Optional related entities
    relatedId: {
      type: Schema.Types.ObjectId,
      refPath: "relatedModel",
    },
    relatedModel: {
      type: String,
      enum: ["Payment", "Complaint", "RoomChangeRequest", "User", "Room"],
    },

    // Status tracking
    isRead: {
      type: Boolean,
      default: false,
    },
    isEmailSent: {
      type: Boolean,
      default: false,
    },
    emailDetails: {
      to: String,
      subject: String,
      sentAt: Date,
      success: Boolean,
    },

    // Active status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to get user information
NotificationSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

// Create model
const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);

export default Notification;
