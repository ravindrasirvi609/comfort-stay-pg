import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Mail,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  CalendarX,
} from "lucide-react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { createPortal } from "react-dom";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type:
    | "Payment"
    | "Complaint"
    | "RoomChange"
    | "System"
    | "Email"
    | "Contact"
    | "Other"
    | "NoticePeriod";
  isRead: boolean;
  createdAt: string;
}

interface NotificationDropdownProps {
  className?: string;
}

export default function NotificationDropdown({
  className = "",
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside - FIXED VERSION
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // Don't close if clicking on the bell button or inside the dropdown
      if (
        (buttonRef.current && buttonRef.current.contains(target)) ||
        (dropdownRef.current && dropdownRef.current.contains(target))
      ) {
        return;
      }

      setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Check for unread notifications on initial load
  useEffect(() => {
    fetchUnreadCount();

    // Poll for new notifications every minute
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(
        "/api/notifications?unreadOnly=true&limit=1"
      );
      if (response.data.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/notifications?limit=10");
      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await axios.put("/api/notifications", {
        notificationIds: [id],
      });

      if (response.data.success) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification._id === id
              ? { ...notification, isRead: true }
              : notification
          )
        );
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await axios.put("/api/notifications", {
        markAll: true,
      });

      if (response.data.success) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) => ({
            ...notification,
            isRead: true,
          }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await axios.delete(`/api/notifications/${id}`);

      if (response.data.success) {
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notification) => notification._id !== id)
        );
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "Payment":
        return (
          <span className="text-green-500">
            <CheckCircle size={16} />
          </span>
        );
      case "Complaint":
        return (
          <span className="text-red-500">
            <AlertCircle size={16} />
          </span>
        );
      case "Email":
        return (
          <span className="text-blue-500">
            <Mail size={16} />
          </span>
        );
      case "Contact":
        return (
          <span className="text-amber-500">
            <Mail size={16} />
          </span>
        );
      case "NoticePeriod":
        return (
          <span className="text-orange-500">
            <CalendarX size={16} />
          </span>
        );
      default:
        return (
          <span className="text-purple-500">
            <Clock size={16} />
          </span>
        );
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  const handleCloseDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
  };

  const dropdownContent = isOpen && (
    <div
      className="fixed inset-0 z-[9999] bg-transparent pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <div
        ref={dropdownRef}
        className="absolute right-0 top-0 mt-12 mr-4 md:mr-6 pointer-events-auto"
        style={{
          maxWidth: "calc(100vw - 2rem)",
        }}
      >
        <div className="w-80 md:w-96 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-lg shadow-lg border border-pink-100 dark:border-gray-700 py-1 max-h-[80vh] overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300 px-2 py-1 rounded hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                type="button"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-[calc(80vh-3rem)] py-1">
            {loading ? (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-4 ${
                    notification.isRead
                      ? "border-transparent"
                      : "border-pink-500 bg-pink-50 dark:bg-pink-900/10"
                  } transition-colors duration-200`}
                >
                  <div className="flex justify-between">
                    <div className="flex items-start space-x-2">
                      {getNotificationIcon(notification.type)}
                      <div className="space-y-1 flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium line-clamp-1 ${
                            notification.isRead
                              ? "text-gray-700 dark:text-gray-300"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {getTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-1 ml-2">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => markAsRead(e, notification._id)}
                          className="text-gray-400 hover:text-pink-500 dark:text-gray-500 dark:hover:text-pink-400 p-1 rounded hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                          title="Mark as read"
                          type="button"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={(e) => deleteNotification(e, notification._id)}
                        className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete notification"
                        type="button"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                <p>No notifications</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="mt-auto border-t border-gray-200 dark:border-gray-700 p-2 text-center">
              <button
                onClick={handleCloseDropdown}
                className="text-xs text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300 px-3 py-1 rounded hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                type="button"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        className="relative p-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none rounded-full"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        type="button"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-pink-600 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {mounted && isOpen && createPortal(dropdownContent, document.body)}
    </div>
  );
}
