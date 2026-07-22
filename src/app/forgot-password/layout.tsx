import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Forgot Password - ComfortStay PG",
  description: "Reset your ComfortStay PG account password.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FF6D9F",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
