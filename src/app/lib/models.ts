// This file imports all models to ensure they are registered with Mongoose
// before they are used in the application

import "../api/models/Room";
import "../api/models/User";
import "../api/models/Payment";
import "../api/models/Complaint";
import "../api/models/RoomChangeRequest";
import "../api/models/Notification";
import "../api/models/ContactInquiry";
import "../api/models/VisitRequest";
import "../api/models/Subscriber";
import "../api/models/UserArchive";
import "../api/models/Notice";
import "../api/models/Counter";

// This file doesn't export anything - it's just to ensure models are loaded
