import mongoose from "mongoose";

const PGDetailsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "PG Name is required"],
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    pincode: {
      type: String,
      default: "",
    },
    contactEmail: {
      type: String,
      default: "",
    },
    contactPhone: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    rules: {
      type: [String],
      default: [],
    },
    features: {
      wifi: {
        type: Boolean,
        default: false,
      },
      food: {
        type: Boolean,
        default: false,
      },
      laundry: {
        type: Boolean,
        default: false,
      },
      cleaning: {
        type: Boolean,
        default: false,
      },
      parking: {
        type: Boolean,
        default: false,
      },
      security: {
        type: Boolean,
        default: false,
      },
    },
    paymentDetails: {
      bankName: {
        type: String,
        default: "",
      },
      accountNumber: {
        type: String,
        default: "",
      },
      ifscCode: {
        type: String,
        default: "",
      },
      upiId: {
        type: String,
        default: "",
      },
    },
    notificationSettings: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      smsNotifications: {
        type: Boolean,
        default: false,
      },
      paymentReminders: {
        type: Boolean,
        default: true,
      },
      maintenanceAlerts: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Check if the model exists before creating a new one
// This prevents Next.js hot reload from throwing an error
const PGDetails =
  mongoose.models.PGDetails || mongoose.model("PGDetails", PGDetailsSchema);

export default PGDetails;
