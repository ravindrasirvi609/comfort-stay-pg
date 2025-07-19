import Amenities from "@/components/Amenities";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facilities - Comfort Stay PG | Best Girls PG in Hinjewadi Phase 1",
  description:
    "Discover our modern facilities at Comfort Stay PG in Hinjewadi Phase 1, Pune. Brand new building with comfortable 2 & 3 sharing rooms Opened February 2025.",
  keywords:
    "girls PG facilities Hinjewadi, ladies PG amenities Pune, 2 sharing PG rooms, 3 sharing accommodation, Comfort Stay facilities, new PG Hinjewadi 2025",
  openGraph: {
    title: "Modern Facilities at Comfort Stay PG - New Girls PG in Hinjewadi",
    description:
      "Brand new PG accommodation with premium 2 & 3 sharing rooms, high-speed WiFi, nutritious meals, and 24/7 security. Opened February 2025.",
    type: "website",
  },
};

export default function FacilitiesPage() {
  return (
    <div className="space-y-16">
      <section className="py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-pink-700 dark:from-pink-400 dark:to-pink-600">
            Our Facilities
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover all the amenities and facilities available at our brand new
            Comfort Stay PG opened in February 2025, designed to make your stay
            comfortable and enjoyable.
          </p>
          <p className="text-base text-pink-600 dark:text-pink-400 font-medium mb-8 max-w-3xl mx-auto">
            Limited rooms still available in our 2-sharing and 3-sharing
            options!
          </p>
        </div>
      </section>

      <Amenities />

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
            Comprehensive Facilities
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-md hover:shadow-lg transition border border-pink-100 dark:border-pink-900/20 group hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 mb-6 rounded-xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center group-hover:bg-pink-200 dark:group-hover:bg-pink-900/30 transition duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 text-pink-500 dark:text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                24/7 Security
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Round-the-clock security with CCTV surveillance, and security
                personnel for your complete safety.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-md hover:shadow-lg transition border border-pink-100 dark:border-pink-900/20 group hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 mb-6 rounded-xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center group-hover:bg-pink-200 dark:group-hover:bg-pink-900/30 transition duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 text-pink-500 dark:text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                Flexible Stay Options
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose from short-term, long-term, or custom duration stays with
                transparent and flexible payment plans.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-md hover:shadow-lg transition border border-pink-100 dark:border-pink-900/20 group hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 mb-6 rounded-xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center group-hover:bg-pink-200 dark:group-hover:bg-pink-900/30 transition duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 text-pink-500 dark:text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                24x7 Power Backup
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Uninterrupted power supply with high-capacity backup generators
                for all your needs.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-md hover:shadow-lg transition border border-pink-100 dark:border-pink-900/20 group hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 mb-6 rounded-xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center group-hover:bg-pink-200 dark:group-hover:bg-pink-900/30 transition duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 text-pink-500 dark:text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                Homely Atmosphere
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Carefully designed spaces that create a warm, comfortable
                feeling of home away from home.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-md hover:shadow-lg transition border border-pink-100 dark:border-pink-900/20 group hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 mb-6 rounded-xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center group-hover:bg-pink-200 dark:group-hover:bg-pink-900/30 transition duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 text-pink-500 dark:text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                High-Speed Internet
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Unlimited high-speed WiFi connectivity available throughout the
                premises for work and entertainment.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-md hover:shadow-lg transition border border-pink-100 dark:border-pink-900/20 group hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 mb-6 rounded-xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center group-hover:bg-pink-200 dark:group-hover:bg-pink-900/30 transition duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 text-pink-500 dark:text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                Hygienic Food
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Nutritious, home-style meals prepared in hygienic conditions,
                with options for special dietary requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-pink-50/50 dark:bg-pink-900/5 rounded-3xl">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
            Room Types & Accommodations
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 border border-pink-100 dark:border-pink-900/20">
              <div className="h-48 bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24 text-pink-300 dark:text-pink-700/50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                  Double Sharing
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Comfortable 2-sharing rooms with modern furnishings, ample
                  storage space, and all essential amenities. Perfect for those
                  who enjoy a balance of privacy and companionship.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 py-1 px-2 rounded-full">
                    Shared Room (2)
                  </span>
                  <span className="text-xs bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 py-1 px-2 rounded-full">
                    Attached Bathroom
                  </span>
                  <span className="text-xs bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 py-1 px-2 rounded-full">
                    Brand New
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 border border-pink-100 dark:border-pink-900/20">
              <div className="h-48 bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24 text-pink-300 dark:text-pink-700/50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                  Triple Sharing
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Economical 3-sharing rooms that provide a social living
                  environment without compromising on comfort. Each room
                  features quality furniture and well-designed spaces.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 py-1 px-2 rounded-full">
                    Shared Room (3)
                  </span>
                  <span className="text-xs bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 py-1 px-2 rounded-full">
                    Attached Bathroom
                  </span>
                  <span className="text-xs bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 py-1 px-2 rounded-full">
                    Budget Friendly
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-md text-center">
            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
              Brand New Building - Opened February 2025
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Our PG is housed in a brand new building with modern design and
              infrastructure, ensuring the best living experience for all
              residents. Limited rooms still available!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
