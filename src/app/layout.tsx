import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Comfort Stay PG - Premium Girls PG Accommodation in Hinjawadi, Pune",
  description:
    "Experience comfortable living at Comfort Stay PG, a premium girls' PG accommodation located in Hinjawadi Phase 1, Pune. Modern amenities, high-speed WiFi, and 24/7 security.",
  keywords:
    "Girls PG in Hinjawadi, PG in Pune, Comfort Stay PG, Girls Accommodation, Ladies PG, Women's Hostel, Hinjewadi Phase 1, Female PG, Working Women Accommodation",
  openGraph: {
    title: "Comfort Stay PG - Premium Girls PG Accommodation",
    description:
      "Experience comfortable living at Comfort Stay PG, located in Hinjawadi Phase 1, Pune.",
    type: "website",
    locale: "en_IN",
  },
  authors: [{ name: "Comfort Stay PG" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#FF92B7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
