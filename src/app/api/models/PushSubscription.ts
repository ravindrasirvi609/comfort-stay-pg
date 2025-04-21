import mongoose, { Schema } from "mongoose";
import { IPushSubscription } from "../interfaces/models";

const PushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    // The subscription endpoint URL
    endpoint: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Expiration time in milliseconds
    expirationTime: {
      type: Number,
      default: null,
    },

    // Encryption keys required for sending push messages
    keys: {
      p256dh: {
        type: String,
        required: true,
      },
      auth: {
        type: String,
        required: true,
      },
    },

    // Optional metadata
    userAgent: {
      type: String,
    },

    // Optional user segment for targeted notifications
    segment: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Create a compound index for faster lookups
PushSubscriptionSchema.index({ endpoint: 1, "keys.auth": 1 });

// Prevent next.js hot reload errors by checking if model exists before creating
const PushSubscription =
  mongoose.models.PushSubscription ||
  mongoose.model("PushSubscription", PushSubscriptionSchema);

export default PushSubscription;
