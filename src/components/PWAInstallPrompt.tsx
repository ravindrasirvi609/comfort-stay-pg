"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent Chrome from showing the default install prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show our custom prompt
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    // Clear the deferredPrompt variable
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 mx-auto w-[90%] max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 border border-pink-200 dark:border-pink-800">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 dark:text-white">
            Install Comfort Stay App
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Install our app for a better experience with faster access and
            offline capabilities.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X size={20} />
        </button>
      </div>
      <div className="mt-3 flex justify-end space-x-2">
        <button
          onClick={handleDismiss}
          className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:underline"
        >
          Maybe later
        </button>
        <button
          onClick={handleInstallClick}
          className="px-4 py-1.5 text-sm bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"
        >
          Install
        </button>
      </div>
    </div>
  );
}
