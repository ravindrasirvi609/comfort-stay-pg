import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    // Registration and authentication
    password: {
      type: String, // Required only after admin approval
      required: false,
    },
    pgId: {
      type: String, // Generated on admin approval
      unique: true,
      sparse: true, // Allow null/undefined values to not conflict with uniqueness
      required: false,
    },
    registrationStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    // Additional user details
    fathersName: {
      type: String,
      required: true,
    },
    permanentAddress: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    guardianMobileNumber: {
      type: String,
      required: true,
    },
    validIdType: {
      type: String,
      enum: ["Aadhar Card", "Passport", "Driving License", "Voter Card"],
      required: true,
    },
    companyNameAndAddress: {
      type: String,
      required: true,
    },

    // Document links
    validIdPhoto: {
      type: String,
      required: true,
    },
    passportPhoto: {
      type: String,
      required: true,
    },
    documents: [String], // Additional documents

    // Room relationship
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
    allocatedRoomNo: {
      type: String,
      default: "",
    },

    // Rejection details
    rejectionReason: {
      type: String,
    },

    // Date tracking
    moveInDate: {
      type: Date,
    },
    moveOutDate: Date,
    approvalDate: Date,
    rejectionDate: Date,

    // Status fields
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
    toJSON: { virtuals: true }, // Include virtuals when converted to JSON
    toObject: { virtuals: true }, // Include virtuals when converted to objects
  }
);

// Virtual fields for relationship navigation
UserSchema.virtual("payments", {
  ref: "Payment",
  localField: "_id",
  foreignField: "userId",
});

UserSchema.virtual("complaints", {
  ref: "Complaint",
  localField: "_id",
  foreignField: "userId",
});

// Create model
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
