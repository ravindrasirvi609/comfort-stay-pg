import User from "./User";
import Room from "./Room";
import Payment from "./Payment";
import Complaint from "./Complaint";
import RoomChangeRequest from "./RoomChangeRequest";
import Notification from "./Notification";

export { User, Room, Payment, Complaint, RoomChangeRequest, Notification };

// Export a function to ensure all models are registered
export function ensureAllModels() {
  return {
    User,
    Room,
    Payment,
    Complaint,
    RoomChangeRequest,
    Notification,
  };
}
