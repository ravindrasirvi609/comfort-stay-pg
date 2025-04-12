import mongoose, { Schema } from "mongoose";

const ComplaintSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Resolved"],
    default: "Open",
  },
  assignedTo: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.models.Complaint ||
  mongoose.model("Complaint", ComplaintSchema);
