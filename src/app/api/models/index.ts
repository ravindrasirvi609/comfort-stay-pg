import User from "./User";
import PendingUser from "./PendingUser";
import Room from "./Room";
import Payment from "./Payment";
import Complaint from "./Complaint";

export { User, PendingUser, Room, Payment, Complaint };

// Export a function to ensure all models are registered
export function ensureAllModels() {
  return {
    User,
    PendingUser,
    Room,
    Payment,
    Complaint,
  };
}
