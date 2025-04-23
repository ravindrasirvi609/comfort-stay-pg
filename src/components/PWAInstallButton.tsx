"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAInstallButtonProps {
  className?: string;
}

export default function PWAInstallButton({
  className = "",
}: PWAInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const checkIfIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    setIsIOS(checkIfIOS());

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Update UI to notify the user they can install the PWA
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if app is already installed
    const handleAppInstalled = () => {
      // App is installed, hide the install button
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log("PWA was installed");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // Clean up event listeners
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(!showIOSInstructions);
      return;
    }

    if (!deferredPrompt) {
      console.log("No installation prompt available");
      return;
    }

    setIsLoading(true);

    try {
      // Show the prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }

      // Clear the saved prompt since it can't be used again
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (err) {
      console.error("Error installing PWA:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // If the app is not installable or already installed, don't show the button
  if (!isInstallable && !isIOS) return null;

  return (
    <div className="relative">
      <button
        onClick={handleInstallClick}
        disabled={isLoading && !isIOS}
        className={`flex items-center justify-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition disabled:opacity-50 ${className}`}
      >
        <Download size={16} />
        <span className="hidden sm:inline">
          {isIOS ? "Install App" : "Download App"}
        </span>
        <span className="sm:hidden">App</span>
      </button>

      {/* iOS Installation Instructions */}
      {isIOS && showIOSInstructions && (
        <div className="absolute top-full right-0 mt-2 p-4 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 w-72">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p className="font-semibold mb-2">To install on iOS:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Tap the share icon{" "}
                <span className="inline-block w-6 h-4 bg-gray-200 dark:bg-gray-700 rounded text-center">
                  ⎙
                </span>{" "}
                at the bottom of the screen
              </li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" in the top right</li>
            </ol>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="mt-3 text-xs text-pink-500 hover:text-pink-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
