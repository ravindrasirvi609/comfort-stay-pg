import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

// Define metadataBase for correct URL resolving
const siteUrl = "https://www.comfortstaypg.com";

export const metadata: Metadata = {
  // Add metadataBase
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Comfort Stay PG - Premium Girls PG Accommodation in Hinjawadi, Pune",
    template: "%s | Comfort Stay PG", // Allows page titles to be dynamic like "About Us | Comfort Stay PG"
  },
  description:
    "Experience comfortable and secure living at Comfort Stay PG, a premium girls' PG accommodation located in Hinjawadi Phase 1, Pune. Offering modern amenities, high-speed WiFi, healthy meals, and 24/7 security.",
  keywords: [
    "Girls PG in Hinjawadi",
    "PG in Pune",
    "Comfort Stay PG",
    "Girls Accommodation",
    "Ladies PG",
    "Women's Hostel",
    "Hinjewadi Phase 1",
    "Female PG",
    "Working Women Accommodation",
    "Student Accommodation Pune",
    "Affordable PG in Hinjawadi",
    "PG near IT Park Pune",
    "Best PG for women in Pune",
  ],
  openGraph: {
    title: "Comfort Stay PG - Premium Girls PG in Hinjawadi, Pune",
    description:
      "Comfortable & secure girls' PG in Hinjawadi Phase 1, Pune with modern amenities, nutritious meals, and 24/7 security.",
    url: siteUrl,
    siteName: "Comfort Stay PG",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Comfort Stay PG Hinjawadi Pune",
      },
    ],
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Comfort Stay PG - Premium Girls PG in Hinjawadi, Pune",
    description:
      "Comfortable & secure girls' PG in Hinjawadi Phase 1, Pune with modern amenities.",
    images: ["/og-image.png"],
  },
  authors: [{ name: "Comfort Stay PG", url: siteUrl }],
  alternates: {
    canonical: siteUrl,
  },
  category: "Accommodation",
  creator: "Comfort Stay PG",
  publisher: "Comfort Stay PG",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "google-site-verification-code", // Replace with your actual verification code
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  applicationName: "Comfort Stay PG",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Changed to allow zooming for better accessibility
  userScalable: true, // Changed to true for better accessibility
  themeColor: "#FF92B7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* <head> section is generally managed by Next.js metadata API,
          custom tags like PWA links might still be needed here if not covered by manifest */}
      <head>
        {/* If manifest.json handles icons, these might be redundant */}
        {/* <link rel="apple-touch-icon" href="/icons/icon-192x192.png" /> */}
        {/* <meta name="apple-mobile-web-app-capable" content="yes" /> */}
        {/* <meta name="apple-mobile-web-app-status-bar-style" content="default" /> */}
        {/* <meta name="apple-mobile-web-app-title" content="Comfort Stay PG" /> */}
      </head>
      <body className={poppins.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-[#fff5f8] via-[#fff8fb] to-[#fff2f6] dark:from-[#472e3e] dark:via-[#422937] dark:to-[#3e2534] overflow-x-hidden">
            <div className="fixed top-[-10%] right-[-5%] w-2/5 h-2/5 bg-gradient-to-br from-pink-50 to-transparent rounded-full blur-3xl -z-10 dark:from-pink-900/5"></div>
            <div className="fixed bottom-[-10%] left-[-5%] w-2/5 h-2/5 bg-gradient-to-tr from-pink-50 to-transparent rounded-full blur-3xl -z-10 dark:from-pink-900/5"></div>
            <div className="fixed top-1/4 left-[-10%] w-1/3 h-1/3 bg-gradient-to-tr from-pink-100/20 to-transparent rounded-full blur-3xl -z-10 dark:from-pink-800/5"></div>
            <div className="fixed bottom-1/4 right-[-10%] w-1/3 h-1/3 bg-gradient-to-bl from-pink-100/20 to-transparent rounded-full blur-3xl -z-10 dark:from-pink-800/5"></div>
            <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmVhZjAiPjwvcmVjdD4KPC9zdmc+')] opacity-30 -z-10"></div>
            <Navbar />
            <main className="container mx-auto px-4 py-8">{children}</main>
            <Footer />
            <LocalBusinessSchema />
            <Analytics />
            <SpeedInsights />
          </div>
        </Providers>
      </body>
    </html>
  );
}
