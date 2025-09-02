import React, { useState } from "react";
import axios from "axios";
import { FaTrash, FaInfo, FaSpinner } from "react-icons/fa";

interface CacheStats {
  size: number;
  keys: string[];
  message: string;
}

export default function CacheManager() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [pattern, setPattern] = useState("");
  const [message, setMessage] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/cache");
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching cache stats:", error);
      setMessage("Failed to fetch cache statistics");
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      setClearing(true);
      const params = pattern ? `?pattern=${encodeURIComponent(pattern)}` : "";
      const response = await axios.delete(`/api/cache${params}`);

      if (response.data.success) {
        setMessage(response.data.message);
        setPattern("");
        // Refresh stats after clearing
        await fetchStats();
      }
    } catch (error) {
      console.error("Error clearing cache:", error);
      setMessage("Failed to clear cache");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Cache Management
      </h3>

      {/* Cache Stats */}
      <div className="mb-6">
        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Loading...
            </>
          ) : (
            <>
              <FaInfo className="mr-2" />
              Get Cache Stats
            </>
          )}
        </button>

        {stats && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Cache Entries:</strong> {stats.size}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {stats.message}
            </p>
            {stats.keys.length > 0 && (
              <details className="mt-2">
                <summary className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  View Cache Keys ({stats.keys.length})
                </summary>
                <div className="mt-2 max-h-40 overflow-y-auto">
                  {stats.keys.map((key, index) => (
                    <div
                      key={index}
                      className="text-xs text-gray-600 dark:text-gray-400 py-1 px-2 bg-white dark:bg-gray-800 rounded mb-1"
                    >
                      {key}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {/* Cache Clear */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Pattern to clear (optional, e.g., 'users-with-dues')"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <button
            onClick={clearCache}
            disabled={clearing}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {clearing ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Clearing...
              </>
            ) : (
              <>
                <FaTrash className="mr-2" />
                Clear Cache
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Leave pattern empty to clear all cache. Use specific patterns like
          &ldquo;users-with-dues&rdquo; to clear only related entries.
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-md">
          <p className="text-sm text-green-700 dark:text-green-300">
            {message}
          </p>
        </div>
      )}

      {/* Cache Info */}
      <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
        <p>
          <strong>Note:</strong> Cache improves performance by storing
          frequently accessed data in memory.
        </p>
        <p className="mt-1">
          <strong>TTL:</strong> Cached data automatically expires after 5
          minutes and is refreshed on next request.
        </p>
        <p className="mt-1">
          <strong>Auto-invalidation:</strong> Cache is automatically cleared
          when related data (payments, settlements, users) is modified.
        </p>
      </div>
    </div>
  );
}
