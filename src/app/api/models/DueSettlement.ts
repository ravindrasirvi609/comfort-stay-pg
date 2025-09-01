import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Due Settlement model interface
 * Tracks settlements (waivers/forgiveness) of due amounts separately from payments
 */
export interface IDueSettlement extends Document {
  _id: any; // Making this required to satisfy Document interface
  userId: Schema.Types.ObjectId;
  month: string; // "Month Year" format (e.g., "September 2025")
  amount: number; // Settlement amount
  reason:
    | "Mid-month entry"
    | "Special discount"
    | "Compensation"
    | "Admin discretion"
    | "Other";
  remarks?: string; // Optional additional details
  settledBy: Schema.Types.ObjectId; // Admin who settled
  settledAt: Date; // Settlement timestamp
  isActive: boolean; // Soft delete support
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Due Settlement Schema
 */
const DueSettlementSchema: Schema<IDueSettlement> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    month: {
      type: String,
      required: true,
      trim: true,
      // Validate format "Month Year"
      validate: {
        validator: function (value: string) {
          return /^[A-Za-z]+ \d{4}$/.test(value);
        },
        message:
          'Month must be in "Month Year" format (e.g., "September 2025")',
      },
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Settlement amount must be greater than 0"],
      // Round to 2 decimal places
      set: (value: number) => Math.round(value * 100) / 100,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "Mid-month entry",
        "Special discount",
        "Compensation",
        "Admin discretion",
        "Other",
      ],
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, "Remarks cannot exceed 500 characters"],
    },
    settledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    settledAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    // Add compound indexes for efficient queries
    indexes: [
      { userId: 1, month: 1 }, // For finding settlements by user and month
      { settledBy: 1, settledAt: -1 }, // For admin settlement history
      { isActive: 1, settledAt: -1 }, // For active settlements chronologically
    ],
  }
);

// Add compound index for unique constraint (one settlement per user per month)
DueSettlementSchema.index({ userId: 1, month: 1 }, { unique: false }); // Allow multiple settlements per month

// Instance methods
DueSettlementSchema.methods.toJSON = function () {
  const settlement = this.toObject();
  return settlement;
};

// Static methods
DueSettlementSchema.statics.findActiveSettlements = function (
  userId?: string,
  month?: string
) {
  const query: any = { isActive: true };

  if (userId) {
    query.userId = userId;
  }

  if (month) {
    query.month = month;
  }

  return this.find(query)
    .populate("userId", "name email pgId")
    .populate("settledBy", "name email")
    .sort({ settledAt: -1 });
};

DueSettlementSchema.statics.getTotalSettledForUserMonth = function (
  userId: string,
  month: string
) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        month: month,
        isActive: true,
      },
    },
    {
      $group: {
        _id: null,
        totalSettled: { $sum: "$amount" },
        settlementCount: { $sum: 1 },
      },
    },
  ]);
};

DueSettlementSchema.statics.getSettlementHistory = function (
  userId: string,
  limit: number = 10
) {
  return this.find({
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true,
  })
    .populate("settledBy", "name email")
    .sort({ settledAt: -1 })
    .limit(limit);
};

// Pre-save middleware
DueSettlementSchema.pre("save", function (next) {
  // Ensure month format is consistent
  if (this.month) {
    const monthWords = this.month.trim().split(" ");
    if (monthWords.length === 2) {
      const monthName =
        monthWords[0].charAt(0).toUpperCase() +
        monthWords[0].slice(1).toLowerCase();
      const year = monthWords[1];
      this.month = `${monthName} ${year}`;
    }
  }

  next();
});

// Create and export model
const DueSettlement: Model<IDueSettlement> =
  mongoose.models?.DueSettlement ||
  mongoose.model<IDueSettlement>("DueSettlement", DueSettlementSchema);

export default DueSettlement;
