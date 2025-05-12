import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/models";

// Adding additional fields specific to archive
interface IUserArchive extends IUser {
  archiveReason: string;
  archiveDate: Date;
  exitSurveyCompleted: boolean;
  stayDuration: number; // in days
  exitFeedback?: {
    overallExperience: number; // 1-5 stars
    cleanliness: number; // 1-5 stars
    facilities: number; // 1-5 stars
    staff: number; // 1-5 stars
    foodQuality: number; // 1-5 stars
    valueForMoney: number; // 1-5 stars
    wouldRecommend: boolean;
    likedMost: string;
    improvements: string;
    exitReason: string;
    otherComments: string;
  };
  keyIssued: boolean;
  depositReturn: {
    amount: number;
    date: Date;
  };
}

const UserArchiveSchema = new Schema<IUserArchive>(
  {
    // Include all fields from User model
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    password: { type: String, required: false },
    pgId: { type: String, required: false },
    registrationStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Approved",
    },
    fathersName: { type: String, required: true },
    permanentAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    guardianMobileNumber: { type: String, required: true },
    validIdType: {
      type: String,
      enum: ["Aadhar Card", "Passport", "Driving License", "Voter Card"],
      required: true,
    },
    companyName: { type: String, required: false },
    companyAddress: { type: String, required: false },
    validIdPhoto: { type: String, required: true },
    profileImage: { type: String, required: true },
    documents: [String],
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
    bedNumber: {
      type: Number,
      default: null,
    },
    rejectionReason: { type: String },
    moveInDate: { type: Date },
    moveOutDate: { type: Date },
    approvalDate: { type: Date },
    rejectionDate: { type: Date },
    isActive: {
      type: Boolean,
      default: false,
    },
    depositFees: {
      type: Number,
      default: 0,
    },
    isOnNoticePeriod: {
      type: Boolean,
      default: false,
    },
    lastStayingDate: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // Key tracking
    keyIssued: {
      type: Boolean,
      default: false,
    },

    // Deposit return tracking
    depositReturn: {
      amount: {
        type: Number,
        default: 0,
      },
      date: {
        type: Date,
      },
    },

    // Archive specific fields
    archiveReason: {
      type: String,
      required: true,
      enum: [
        "Completed Stay",
        "Early Departure",
        "Rule Violation",
        "Payment Issues",
        "Other",
      ],
    },
    archiveDate: {
      type: Date,
      default: Date.now,
    },
    exitSurveyCompleted: {
      type: Boolean,
      default: false,
    },
    stayDuration: {
      type: Number, // in days
      required: true,
    },
    exitFeedback: {
      overallExperience: { type: Number, min: 1, max: 5 },
      cleanliness: { type: Number, min: 1, max: 5 },
      facilities: { type: Number, min: 1, max: 5 },
      staff: { type: Number, min: 1, max: 5 },
      foodQuality: { type: Number, min: 1, max: 5 },
      valueForMoney: { type: Number, min: 1, max: 5 },
      wouldRecommend: Boolean,
      likedMost: String,
      improvements: String,
      exitReason: String,
      otherComments: String,
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create model
const UserArchive =
  mongoose.models.UserArchive ||
  mongoose.model<IUserArchive>("UserArchive", UserArchiveSchema);

export default UserArchive;
