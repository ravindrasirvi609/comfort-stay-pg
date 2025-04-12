import mongoose, { Schema } from "mongoose";

const PaymentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Paid", "Due", "Overdue"],
    default: "Due",
  },
  receiptNumber: {
    type: String,
    required: true,
  },
  remarks: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);
