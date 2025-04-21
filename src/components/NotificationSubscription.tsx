"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

export default function NotificationSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Check if push notifications are supported
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setIsSupported(false);
      return;
    }

    // Check if already subscribed
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription status:", error);
    }
  };

  const subscribe = async () => {
    try {
      setIsLoading(true);

      if (!publicVapidKey) {
        console.error("VAPID public key is not set");
        return;
      }

      // Wait for service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      // Send subscription to backend
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscription }),
      });

      setIsSubscribed(true);

      // Show a confirmation notification
      registration.showNotification("Notifications Enabled", {
        body: "You will now receive notifications from Comfort Stay PG",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/maskable-icon.png",
      });
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
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
        await subscription.unsubscribe();

        // Delete from server (optional)
        await fetch("/api/notifications/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      setIsSubscribed(false);
    } catch (error) {
      console.error("Error unsubscribing from notifications:", error);
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

  // Not supported message
  if (!isSupported) {
    return null; // Don't show anything if not supported
  }

  return (
    <button
      onClick={handleToggleSubscription}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition disabled:opacity-50"
    >
      {isLoading ? (
        <span className="animate-pulse">Processing...</span>
      ) : isSubscribed ? (
        <>
          <BellOff size={16} />
          <span>Disable Notifications</span>
        </>
      ) : (
        <>
          <Bell size={16} />
          <span>Enable Notifications</span>
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
