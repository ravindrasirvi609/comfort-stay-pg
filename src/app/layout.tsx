import type { Metadata, Viewport } from "next";
import { Poppins, Fraunces } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";
import { OrganizationSchema } from "@/components/StructuredData";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";
import AmbientBackground from "@/components/AmbientBackground";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const fraunces = Fraunces({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Define metadataBase for correct URL resolving
const siteUrl = "https://www.comfortstaypg.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Comfort Stay PG - Premium Girls PG Accommodation in Hinjawadi, Pune",
    template: "%s | Comfort Stay PG",
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
    google: "google-site-verification-code",
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
  maximumScale: 5,
  userScalable: true,
  themeColor: "#FF6D9F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${poppins.variable} ${fraunces.variable} font-sans antialiased`}
      >
        <Providers>
          <ScrollProgress />
          <SmoothScroll />
          <div className="app-shell min-h-screen bg-gradient-to-br from-[#fff5f8] via-[#fff8fb] to-[#fff2f6] dark:from-[#472e3e] dark:via-[#422937] dark:to-[#3e2534] overflow-x-hidden">
            <AmbientBackground />
            <Navbar />
            <main className="app-content container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
            <LocalBusinessSchema />
            <OrganizationSchema />
            <Analytics />
            <SpeedInsights />
          </div>
        </Providers>
      </body>
    </html>
  );
}
