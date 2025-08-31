import mongoose, { Schema, Types } from "mongoose";

// Interface for UserDue document
export interface IUserDue {
  _id?: string;
  userId: Types.ObjectId | string;
  month: string; // Format: "January 2025"
  year: number;
  monthNumber: number; // 1-12

  // Rent calculation details
  fullMonthRent: number;
  proratedRent: number; // Calculated based on check-in date or full month
  daysCovered: number; // Number of days in the month this rent covers
  totalDaysInMonth: number;

  // Due tracking
  totalDue: number; // Current month prorated + previous unpaid
  currentMonthDue: number; // Only current month prorated amount
  previousUnpaidDue: number; // Accumulated from previous months

  // Payment tracking
  totalPaid: number;
  remainingDue: number;

  // Credit balance system (Phase 1)
  creditBalance: number; // Available credit from overpayments
  creditUsed: number; // Credit used for this month
  netDue: number; // Due amount after applying credit balance

  // Status and dates
  dueStatus: "Paid" | "Partial" | "Unpaid" | "Overdue";
  dueDate: Date;
  checkInDate?: Date; // If user checked in this month
  isProrated: boolean; // Whether this month's rent is prorated

  // Metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserDueSchema = new Schema<IUserDue>(
  {
    // User relationship
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Month identification
    month: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    monthNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    // Rent calculation details
    fullMonthRent: {
      type: Number,
      required: true,
    },
    proratedRent: {
      type: Number,
      required: true,
    },
    daysCovered: {
      type: Number,
      required: true,
    },
    totalDaysInMonth: {
      type: Number,
      required: true,
    },

    // Due tracking
    totalDue: {
      type: Number,
      required: true,
      default: 0,
    },
    currentMonthDue: {
      type: Number,
      required: true,
      default: 0,
    },
    previousUnpaidDue: {
      type: Number,
      default: 0,
    },

    // Payment tracking
    totalPaid: {
      type: Number,
      default: 0,
    },
    remainingDue: {
      type: Number,
      default: 0,
    },

    // Credit balance system (Phase 1)
    creditBalance: {
      type: Number,
      default: 0,
      min: 0, // Credit balance cannot be negative
    },
    creditUsed: {
      type: Number,
      default: 0,
      min: 0, // Credit used cannot be negative
    },
    netDue: {
      type: Number,
      default: 0,
      min: 0, // Net due cannot be negative
    },

    // Status and dates
    dueStatus: {
      type: String,
      enum: ["Paid", "Partial", "Unpaid", "Overdue"],
      default: "Unpaid",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    checkInDate: {
      type: Date,
    },
    isProrated: {
      type: Boolean,
      default: false,
    },

    // Metadata
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for efficient queries
UserDueSchema.index({ userId: 1, year: 1, monthNumber: 1 }, { unique: true });
UserDueSchema.index({ userId: 1, dueStatus: 1 });
UserDueSchema.index({ dueDate: 1 });
UserDueSchema.index({ isActive: 1 });

// Virtual to get user information
UserDueSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

// Static method to calculate prorated rent
UserDueSchema.statics.calculateProratedRent = function (
  fullMonthRent: number,
  checkInDate: Date,
  targetMonth: number,
  targetYear: number
) {
  const checkInMonth = checkInDate.getMonth() + 1; // getMonth() returns 0-11
  const checkInYear = checkInDate.getFullYear();

  // If check-in is not in the target month, return full rent
  if (checkInMonth !== targetMonth || checkInYear !== targetYear) {
    const totalDaysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    return {
      proratedRent: fullMonthRent,
      daysCovered: totalDaysInMonth,
      totalDaysInMonth,
      isProrated: false,
    };
  }

  const checkInDay = checkInDate.getDate();
  const totalDaysInMonth = new Date(targetYear, targetMonth, 0).getDate();
  const daysCovered = totalDaysInMonth - checkInDay + 1; // +1 to include check-in day

  const dailyRate = fullMonthRent / totalDaysInMonth;
  const proratedRent = Math.ceil(dailyRate * daysCovered); // Round up to nearest rupee

  return {
    proratedRent,
    daysCovered,
    totalDaysInMonth,
    isProrated: true,
  };
};

// Instance method to update payment status
UserDueSchema.methods.updatePaymentStatus = function () {
  this.remainingDue = this.totalDue - this.totalPaid;

  if (this.remainingDue <= 0) {
    this.dueStatus = "Paid";
    this.remainingDue = 0;
  } else if (this.totalPaid > 0) {
    this.dueStatus = "Partial";
  } else if (new Date() > this.dueDate) {
    this.dueStatus = "Overdue";
  } else {
    this.dueStatus = "Unpaid";
  }
};

// Create model
const UserDue =
  mongoose.models.UserDue || mongoose.model<IUserDue>("UserDue", UserDueSchema);

export default UserDue;
