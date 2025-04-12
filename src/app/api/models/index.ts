import User from "./User";
import Room from "./Room";
import Payment from "./Payment";
import Complaint from "./Complaint";

export { User, Room, Payment, Complaint };

// Export a function to ensure all models are registered
export function ensureAllModels() {
  return {
    User,
    Room,
    Payment,
    Complaint,
  };
}
