import mongoose from "mongoose";

const visitRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    preferredDate: {
      type: Date,
      required: [true, "Preferred date is required"],
    },
    preferredTime: {
      type: String,
      required: [true, "Preferred time is required"],
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Scheduled", "Completed", "Cancelled"],
      default: "Pending",
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

const VisitRequest =
  mongoose.models.VisitRequest ||
  mongoose.model("VisitRequest", visitRequestSchema);

export default VisitRequest;
