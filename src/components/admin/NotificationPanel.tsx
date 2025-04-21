import React from "react";
import { FaCalendarTimes, FaBell } from "react-icons/fa";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "NoticePeriod":
      return <FaCalendarTimes className="h-5 w-5 text-orange-500" />;
    case "Notice":
      return <FaBell className="h-5 w-5 text-blue-500" />;
    default:
      return null;
  }
};

const getNotificationBgColor = (type: string, isDarkMode: boolean) => {
  switch (type) {
    case "NoticePeriod":
      return isDarkMode
        ? "bg-orange-900/20 border-orange-800/30"
        : "bg-orange-50 border-orange-100";
    default:
      return "";
  }
};

const getNotificationTextColor = (type: string, isDarkMode: boolean) => {
  switch (type) {
    case "NoticePeriod":
      return isDarkMode ? "text-orange-300" : "text-orange-800";
    default:
      return "";
  }
};

const NotificationPanel: React.FC = () => {
  // Implementation of the component
  return <div>{/* Render your notification components here */}</div>;
};

export default NotificationPanel;
