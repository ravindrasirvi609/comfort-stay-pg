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
    month: {
      type: String,
      required: true,
    },
    // For multiple month payments
    coveredMonths: {
      type: [String],
      default: [],
    },
    isMultiMonthPayment: {
      type: Boolean,
      default: false,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },

    // Status and receipt
    status: {
      type: String,
      enum: ["Paid", "Due", "Overdue", "Partial"],
      default: "Due",
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

// Create model
const Payment =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default Payment;
