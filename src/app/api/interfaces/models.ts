import { Schema } from "mongoose";

/**
 * User model interface
 */
export interface IUser {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "user";
  password?: string;
  pgId?: string;
  registrationStatus: "Pending" | "Approved" | "Rejected";
  fathersName: string;
  permanentAddress: string;
  city: string;
  state: string;
  guardianMobileNumber: string;
  validIdType: "Aadhar Card" | "Passport" | "Driving License" | "Voter Card";
  companyName: string;
  companyAddress: string;
  validIdPhoto: string;
  profileImage: string;
  documents?: string[];
  roomId?: Schema.Types.ObjectId | IRoom;
  bedNumber?: number;
  rejectionReason?: string;
  moveInDate?: Date;
  moveOutDate?: Date;
  approvalDate?: Date;
  rejectionDate?: Date;
  isActive: boolean;
  depositFees?: number;
  isOnNoticePeriod?: boolean;
  lastStayingDate?: Date;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Room model interface
 */
export interface IRoom {
  _id?: string;
  roomNumber: string;
  floor: number;
  type: "2-sharing" | "3-sharing";
  price: number;
  capacity: number;
  currentOccupancy: number;
  amenities?: string[];
  status: "available" | "occupied" | "maintenance";
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  residents?: IUser[];
}

/**
 * Bed assignment interface
 */
export interface IBed {
  bedNumber: number;
  isOccupied: boolean;
  resident: IUser | null;
}

/**
 * Payment model interface
 */
export interface IPayment {
  _id?: string;
  userId: Schema.Types.ObjectId | IUser;
  amount: number;
  months: string[];
  paymentMethod: "Cash" | "UPI" | "Bank Transfer" | "Other";
  paymentStatus: "Paid" | "Pending" | "Failed";
  transactionId?: string;
  paymentDate: Date;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Complaint model interface
 */
export interface IComplaint {
  _id?: string;
  userId: Schema.Types.ObjectId | IUser;
  title: string;
  description: string;
  category:
    | "Maintenance"
    | "Housekeeping"
    | "Food"
    | "Security"
    | "Billing"
    | "Other";
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Payment {
  _id: string;
  userId: string;
  amount: number;
  months: string[];
  paymentDate: Date;
  dueDate?: Date;
  paymentStatus: "Paid" | "Due" | "Overdue" | "Partial" | "Pending";
  receiptNumber?: string;
  paymentMethod: "Cash" | "UPI" | "Bank Transfer" | "Card" | "Other";
  transactionId?: string;
  remarks?: string;
  isActive: boolean;
  isDepositPayment: boolean;
  depositAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Room Change Request interface
 */
export interface IRoomChangeRequest {
  _id?: string;
  userId: Schema.Types.ObjectId | IUser;
  oldRoomId: Schema.Types.ObjectId | IRoom;
  newRoomId: Schema.Types.ObjectId | IRoom;
  oldBedNumber: number;
  newBedNumber: number;
  status: "Completed" | "Cancelled";
  requestedAt: Date;
  completedAt?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Notification model interface
 */
export interface INotification {
  _id?: string;
  userId: Schema.Types.ObjectId | IUser;
  title: string;
  message: string;
  type:
    | "Payment"
    | "Complaint"
    | "RoomChange"
    | "System"
    | "Email"
    | "Other"
    | "NoticePeriod"
    | "Notice";
  relatedId?: Schema.Types.ObjectId;
  relatedModel?:
    | "Payment"
    | "Complaint"
    | "RoomChangeRequest"
    | "User"
    | "Room"
    | "Notice";
  isRead: boolean;
  isEmailSent: boolean;
  emailDetails?: {
    to: string;
    subject: string;
    sentAt: Date;
    success: boolean;
  };
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Contact Inquiry interface
 */
export interface IContactInquiry {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  respondedTo: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Visit Request interface
 */
export interface IVisitRequest {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: Date;
  preferredTime: string;
  message?: string;
  status: "Pending" | "Scheduled" | "Completed" | "Cancelled";
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Subscriber interface
 */
export interface ISubscriber {
  _id?: string;
  email: string;
  subscriptionDate: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
