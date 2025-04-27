import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

// Define metadataBase for correct URL resolving
const siteUrl = "https://comfortstaypg.com";

export const metadata: Metadata = {
  // Add metadataBase
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Comfort Stay PG - Premium Girls PG Accommodation in Hinjawadi, Pune",
    template: "%s | Comfort Stay PG", // Allows page titles to be dynamic like "About Us | Comfort Stay PG"
  },
  description:
    "Experience comfortable and secure living at Comfort Stay PG, a premium girls' PG accommodation located in Hinjawadi Phase 1, Pune. Offering modern amenities, high-speed WiFi, healthy meals, and 24/7 security.", // Slightly refined description
  keywords: [
    // Using an array is slightly cleaner
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
  ], // Added a relevant keyword
  openGraph: {
    title: "Comfort Stay PG - Premium Girls PG in Hinjawadi, Pune", // Slightly more concise
    description:
      "Comfortable & secure girls' PG in Hinjawadi Phase 1, Pune with modern amenities.", // More concise
    url: siteUrl, // Add the site URL
    siteName: "Comfort Stay PG", // Add site name
    // Add image - REMEMBER TO CREATE /public/og-image.png (1200x630 recommended)
    images: [
      {
        url: "/og-image.png", // Path relative to /public folder
        width: 1200,
        height: 630,
        alt: "Comfort Stay PG Hinjawadi Pune",
      },
    ],
    type: "website",
    locale: "en_IN",
  },
  // Add Twitter specific tags for better card display
  twitter: {
    card: "summary_large_image",
    title: "Comfort Stay PG - Premium Girls PG in Hinjawadi, Pune",
    description:
      "Comfortable & secure girls' PG in Hinjawadi Phase 1, Pune with modern amenities.",
    // Use the same image as openGraph
    images: ["/og-image.png"],
  },
  authors: [{ name: "Comfort Stay PG", url: siteUrl }], // Add URL to author if desired
  icons: {
    icon: "/favicon.ico", // Standard favicon
    shortcut: "/favicon-16x16.png", // Example sizes
    apple: "/apple-touch-icon.png", // Apple touch icon
    // other: { // Example for other icons if needed
    //   rel: 'other-icon',
    //   url: '/other-icon.png',
    // },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Often good to allow scaling, consider changing userScalable
  userScalable: false, // Maybe set to true for accessibility? Test usability.
  themeColor: "#FF92B7", // Your brand color
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
          </div>
        </Providers>
      </body>
    </html>
  );
}
