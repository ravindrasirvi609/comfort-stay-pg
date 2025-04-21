"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, SendHorizontal, AlertTriangle } from "lucide-react";

export default function SendNotificationsPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [segment, setSegment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string }>(
    {}
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !body) return;

    setIsLoading(true);
    setResult({});

    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          body,
          url,
          segment: segment || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
        });

        // Reset form after successful submission
        if (response.status === 200) {
          setTitle("");
          setBody("");
          setUrl("/");
          setSegment("");
        }
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to send notification",
        });
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      setResult({
        success: false,
        message: "An error occurred while sending the notification",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-8">
        <Bell className="text-pink-500 mr-3" size={28} />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Send Push Notifications
        </h1>
      </div>

      {result.message && (
        <div
          className={`mb-6 p-4 rounded-md ${
            result.success
              ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
              : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
          }`}
        >
          <div className="flex items-center">
            {result.success ? (
              <SendHorizontal className="mr-2" size={18} />
            ) : (
              <AlertTriangle className="mr-2" size={18} />
            )}
            <p>{result.message}</p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
      >
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Notification Title*
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            placeholder="Enter notification title"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="body"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Notification Body*
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            placeholder="Enter notification message"
            rows={3}
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="url"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Target URL (where to send users when they click)
          </label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            placeholder="/"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="segment"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            User Segment (optional)
          </label>
          <input
            id="segment"
            type="text"
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            placeholder="All users (leave empty to send to everyone)"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            If you have segmented your users (e.g., 'premium', 'new', etc.), you
            can target specific groups.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 mr-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !title || !body}
            className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:opacity-50 flex items-center"
          >
            {isLoading ? (
              <>
                <span className="animate-pulse mr-2">Sending</span>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              </>
            ) : (
              <>
                <SendHorizontal size={16} className="mr-2" />
                Send Notification
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
