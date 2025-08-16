import mongoose, { Schema } from "mongoose";
import { INotification } from "../interfaces/models";

const NotificationSchema = new Schema<INotification>(
  {
    // User relationship
    userId: {
      type: Schema.Types.Mixed, // Changed from ObjectId to Mixed to support string IDs
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
      enum: [
        "Payment",
        "Complaint",
        "RoomChange",
        "System",
        "Email",
        "Other",
        "NoticePeriod",
        "Notice",
        "Contact",
        // Added missing type used in code & interface
        "Checkout",
  // Added to support visit request notifications
  "Visit",
      ],
      default: "System",
    },

    // Optional related entities
    relatedId: {
      type: Schema.Types.Mixed, // Changed to support both ObjectId and string
      refPath: "relatedModel",
    },
    relatedModel: {
      type: String,
      enum: [
        "Payment",
        "Complaint",
        "RoomChangeRequest",
        "User",
        "Room",
        "Notice",
        "ContactInquiry",
        // Added missing related model used in code & interface
        "UserArchive",
      ],
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
