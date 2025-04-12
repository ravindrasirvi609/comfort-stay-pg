import mongoose, { Schema } from "mongoose";

// Define the same schema as in register-request
const PendingUserSchema = new Schema(
  {
    // Basic info
    fullName: { type: String, required: true },
    emailAddress: { type: String, required: true, unique: true },
    fathersName: { type: String, required: true },
    permanentAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    guardianMobileNumber: { type: String, required: true },

    // Identity information
    validIdType: {
      type: String,
      required: true,
      enum: ["Aadhar Card", "Passport", "Driving License", "Voter Card"],
    },
    validIdPhoto: { type: String, required: true },
    companyNameAndAddress: { type: String, required: true },
    passportPhoto: { type: String, required: true },

    // Password (hashed)
    password: {
      type: String,
      required: true,
    },

    // Allocation information (to be filled by admin)
    allocatedRoomNo: { type: String, default: "" },
    checkInDate: { type: Date },

    // Status tracking
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Rejected"],
      default: "Pending",
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Create mongoose model
const PendingUser =
  mongoose.models.PendingUser ||
  mongoose.model("PendingUser", PendingUserSchema);

export default PendingUser;
