import mongoose, { Schema } from "mongoose";

const NoticeSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: Schema.Types.Mixed,
    ref: "User",
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);
