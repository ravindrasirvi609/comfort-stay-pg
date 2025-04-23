"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "react-hot-toast";

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

export default function NotificationSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null
  );

  // Check if push notifications are supported and permission status
  useEffect(() => {
    // Check browser support
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setIsSupported(false);
      return;
    }

    // Check notification permission
    setPermission(Notification.permission);

    // Check if already subscribed
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription status:", error);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  };

  const subscribe = async () => {
    try {
      setIsLoading(true);

      // First check if we have permission, if not prompt for it
      if (Notification.permission !== "granted") {
        const permissionResult = await requestNotificationPermission();
        if (permissionResult !== "granted") {
          toast.error(
            "Notification permission denied. Please enable notifications in your browser settings."
          );
          setIsLoading(false);
          return;
        }
      }

      // Check if VAPID key is available
      if (!publicVapidKey) {
        console.error("VAPID public key is not set");
        toast.error("Server configuration error. Please contact support.");
        setIsLoading(false);
        return;
      }

      // Ensure service worker is registered
      if (!navigator.serviceWorker.controller) {
        toast.loading("Initializing service worker...");
        // Either wait for the service worker to be active or register it
        await navigator.serviceWorker.register("/sw.js");
      }

      // Wait for service worker registration
      const registration = await navigator.serviceWorker.ready;
      console.log("Service worker ready");

      try {
        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });

        console.log("Subscription successful:", subscription);

        // Send subscription to backend
        const response = await fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subscription }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to save subscription on server"
          );
        }

        setIsSubscribed(true);
        toast.success("Notifications enabled successfully!");

        // Show an immediate test notification
        if ("Notification" in window && Notification.permission === "granted") {
          // First try a direct notification
          try {
            new Notification("Notifications Enabled", {
              body: "You will now receive notifications from Comfort Stay PG",
              icon: "/icons/icon-192x192.png",
              badge: "/icons/maskable-icon.png",
            });
            console.log("Direct notification shown");
          } catch (error) {
            console.error("Direct notification failed:", error);
          }

          // Also try a service worker notification
          try {
            registration.showNotification("Notifications Enabled", {
              body: "You will now receive notifications from Comfort Stay PG",
              icon: "/icons/icon-192x192.png",
              badge: "/icons/maskable-icon.png",
            });
            console.log("Service worker notification shown");
          } catch (error) {
            console.error("Service worker notification failed:", error);
          }
        }

        // Send test push notification from the server
        try {
          const testResponse = await fetch("/api/notifications/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: "Test Notification",
              body: "This is a test push notification",
              url: "/",
            }),
          });
          console.log(
            "Server test notification result:",
            await testResponse.json()
          );
        } catch (testError) {
          console.error("Failed to send test notification:", testError);
        }
      } catch (subscribeError) {
        console.error("Subscription error:", subscribeError);
        toast.error("Could not subscribe to notifications. Please try again.");
      }
    } catch (error) {
      console.error("Error in subscribe process:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    try {
      setIsLoading(true);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push manager
        const unsubscribed = await subscription.unsubscribe();

        if (!unsubscribed) {
          throw new Error("Failed to unsubscribe from push service");
        }

        // Delete from server
        await fetch("/api/notifications/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        setIsSubscribed(false);
        toast.success("Notifications disabled");
      }
    } catch (error) {
      console.error("Error unsubscribing from notifications:", error);
      toast.error("Could not disable notifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSubscription = () => {
    if (isSubscribed) {
      unsubscribe();
    } else {
      subscribe();
    }
  };

  // Don't show if not supported
  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={handleToggleSubscription}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition disabled:opacity-50"
      title={isSubscribed ? "Disable notifications" : "Enable notifications"}
    >
      {isLoading ? (
        <span className="animate-pulse">Processing...</span>
      ) : isSubscribed ? (
        <>
          <BellOff size={16} />
          <span className="hidden sm:inline">Disable Notifications</span>
        </>
      ) : (
        <>
          <Bell size={16} />
          <span className="hidden sm:inline">Enable Notifications</span>
        </>
      )}
    </button>
  );
}

// Utility function to convert base64 to Uint8Array
// (required for applicationServerKey)
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
