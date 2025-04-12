import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Login - ComfortStay PG",
  description: "Login to your ComfortStay PG account",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 2,
  userScalable: true,
  themeColor: "#FF92B7",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
