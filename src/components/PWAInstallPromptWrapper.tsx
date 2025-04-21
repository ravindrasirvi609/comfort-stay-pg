"use client";

import dynamic from "next/dynamic";

const PWAInstallPrompt = dynamic(
  () => import("@/components/PWAInstallPrompt"),
  {
    ssr: false,
  }
);

export default function PWAInstallPromptWrapper() {
  return <PWAInstallPrompt />;
}
