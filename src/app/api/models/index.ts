import User from "./User";
import Room from "./Room";
import Payment from "./Payment";
import Complaint from "./Complaint";
import RoomChangeRequest from "./RoomChangeRequest";
import Notification from "./Notification";
import ContactInquiry from "./ContactInquiry";
import VisitRequest from "./VisitRequest";
import Subscriber from "./Subscriber";
import DueSettlement from "./DueSettlement";

export {
  User,
  Room,
  Payment,
  Complaint,
  RoomChangeRequest,
  Notification,
  ContactInquiry,
  VisitRequest,
  Subscriber,
  DueSettlement,
};

// Export a function to ensure all models are registered
export function ensureAllModels() {
  return {
    User,
    Room,
    Payment,
    Complaint,
    RoomChangeRequest,
    Notification,
    ContactInquiry,
    VisitRequest,
    Subscriber,
    DueSettlement,
  };
}
