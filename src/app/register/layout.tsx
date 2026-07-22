import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Register - ComfortStay PG",
  description: "Register for a new ComfortStay PG account",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FF6D9F",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
