"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/hooks/useToast";
import ToastContainer from "@/components/Toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ToastProvider>
        {children}
        <ToastContainer />
      </ToastProvider>
    </ThemeProvider>
  );
}
