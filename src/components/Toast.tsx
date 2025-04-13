"use client";

import React from "react";
import { useToast } from "@/hooks/useToast";

export default function ToastContainer() {
  const { toasts, toast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(({ id, message, type }) => (
        <div
          key={id}
          className={`px-4 py-3 rounded shadow-lg flex justify-between items-center min-w-[300px] ${
            type === "success"
              ? "bg-green-500 text-white"
              : type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
          }`}
        >
          <p>{message}</p>
          <button
            onClick={() => toast.dismiss(id)}
            className="text-white ml-4 hover:opacity-80"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
