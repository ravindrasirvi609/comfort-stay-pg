import About from "@/components/About";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - Comfort Stay PG | New Girls PG in Hinjewadi Phase 1",
  description:
    "Learn about Comfort Stay PG, a brand new girls accommodation in Hinjewadi Phase 1, Pune, opened July 2025. Offering comfortable 2 & 3 sharing rooms for working women and students.",
  keywords:
    "new girls PG Hinjewadi 2025, ladies accommodation Pune, affordable PG Hinjewadi, 2 sharing rooms, 3 sharing PG, working women PG, student accommodation Hinjewadi",
  openGraph: {
    title: "About Comfort Stay PG - New Girls Accommodation in Hinjewadi",
    description:
      "Brand new PG opened July 2025 with premium 2 & 3 sharing rooms in Hinjewadi Phase 1, Pune. Designed specifically for working women and students.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="space-y-16">
      <section className="py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-pink-700 dark:from-pink-400 dark:to-pink-600">
            About Comfort Stay PG
          </h1>
          <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            A brand new girls PG accommodation in Hinjewadi Phase 1, Pune,
            opened July 2025. Offering comfortable 2 & 3 sharing rooms for
            working women and students.
          </p>
        </div>
      </section>

      <About />

      <section className="py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-8 shadow-md hover:shadow-lg transition duration-300 border border-pink-100 dark:border-pink-900/20">
              <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center mb-6 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-pink-500 dark:text-pink-400"
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
              <h3 className="text-xl font-semibold text-center mb-4 text-gray-800 dark:text-white">
                Our Mission
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                To provide a safe, comfortable, and supportive living
                environment that feels like a home away from home for young
                women.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-8 shadow-md hover:shadow-lg transition duration-300 border border-pink-100 dark:border-pink-900/20">
              <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center mb-6 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-pink-500 dark:text-pink-400"
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
              <h3 className="text-xl font-semibold text-center mb-4 text-gray-800 dark:text-white">
                Our Values
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Safety, comfort, respect, community, and excellence in
                everything we do to ensure our residents thrive.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-8 shadow-md hover:shadow-lg transition duration-300 border border-pink-100 dark:border-pink-900/20">
              <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center mb-6 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-pink-500 dark:text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-4 text-gray-800 dark:text-white">
                Our Team
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Dedicated professionals committed to creating a positive,
                nurturing environment for all our residents.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-pink-50/50 dark:bg-pink-900/5 rounded-3xl">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
            Why Choose Comfort Stay PG?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-pink-500 dark:text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  Prime Location
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Strategically located in Hinjewadi Phase 1, providing easy
                  access to major IT parks, shopping centers, and transportation
                  hubs.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-pink-500 dark:text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  Security First
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  24/7 security with CCTV surveillance, secure entry systems,
                  and professional staff to ensure your safety.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-pink-500 dark:text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  Modern Amenities
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  High-speed WiFi, modern furnishings, power backup, and all
                  essential facilities for a comfortable living experience.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-pink-500 dark:text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  Flexible Terms
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Accommodating short and long-term stays with flexible payment
                  options to suit your needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              What Sets Us Apart
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
              Features that make Comfort Stay the preferred choice
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-pink-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-pink-600 dark:text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Prime Location
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Strategically located in Hinjewadi Phase 1, providing easy
                access to major IT parks, shopping centers, and transportation
                hubs.
              </p>
            </div>

            <div className="bg-pink-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-pink-600 dark:text-pink-400"
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
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Brand New Building
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Our PG is housed in a newly constructed building opening in July
                2025, featuring modern design, fresh interiors, and the latest
                amenities. Be among the first residents to enjoy our pristine
                facilities.
              </p>
            </div>

            <div className="bg-pink-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-pink-600 dark:text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Room Options
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                We exclusively offer comfortable 2-sharing and 3-sharing rooms,
                each thoughtfully designed with quality furnishings and personal
                space. Limited rooms still available in our facility that opened
                in July 2025.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
