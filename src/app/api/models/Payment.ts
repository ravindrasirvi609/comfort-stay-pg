import mongoose, { Schema } from "mongoose";

const PaymentSchema = new Schema(
  {
    // User relationship
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Payment details
    amount: {
      type: Number,
      required: true,
    },
    months: {
      type: [String],
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },

    // Status and receipt
    paymentStatus: {
      type: String,
      enum: ["Paid", "Due", "Overdue", "Partial", "Pending"],
      default: "Pending",
    },
    receiptNumber: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Card", "Other"],
      default: "Cash",
    },
    transactionId: {
      type: String,
    },

    // Additional information
    remarks: String,
    isActive: {
      type: Boolean,
      default: true,
    },

    // Deposit fee tracking
    isDepositPayment: {
      type: Boolean,
      default: false,
    },
    depositAmount: {
      type: Number,
      default: 0,
    },

    // Timestamps
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to get user information
PaymentSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

// Virtual to detect if it's a multi-month payment
PaymentSchema.virtual("isMultiMonthPayment").get(function () {
  return this.months.length > 1;
});

// Create model
const Payment =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default Payment;
