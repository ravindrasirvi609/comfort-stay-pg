"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/hooks/useToast";
import ToastContainer from "@/components/Toast";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ToastProvider>
        {children}
        <ToastContainer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--toast-background, #fff)",
              color: "var(--toast-color, #333)",
              boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
              padding: "16px",
              borderRadius: "8px",
            },
            success: {
              iconTheme: {
                primary: "#10B981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </ToastProvider>
    </ThemeProvider>
  );
}
