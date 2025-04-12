import Contact from "@/components/Contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Comfort Stay PG | Best Girls PG in Hinjewadi Phase 1",
  description:
    "Contact Comfort Stay PG in Hinjewadi Phase 1, Pune. New premium accommodation for women starting March 2025. Call us at 9922538989 to book your stay today.",
  keywords:
    "girls PG Hinjewadi, ladies PG Pune, Comfort Stay PG contact, Hinjewadi Phase 1 PG, working women accommodation Pune, affordable PG Hinjewadi, new PG Hinjewadi 2025",
  openGraph: {
    title: "Contact Comfort Stay PG - New Premium Girls PG in Hinjewadi",
    description:
      "Brand new PG accommodation Opened March 2025 with 2 & 3 sharing options. Contact us at 9922538989 for pre-bookings and inquiries.",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="space-y-16">
      <section className="py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-pink-700 dark:from-pink-400 dark:to-pink-600">
            Contact Us
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            We&apos;re here to assist you with any queries about our brand new
            accommodation opened in March 2025. Reach out to us for pre-bookings
            and we&apos;ll get back to you promptly.
          </p>
        </div>
      </section>

      <Contact />

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
                Visit Our Location
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                We invite you to visit our premises and experience the comfort
                firsthand. Our new building is designed with modern amenities to
                provide the best living experience for women. Our staff will be
                happy to give you a tour and answer any questions in person.
              </p>

              <div className="space-y-6">
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
                      Address
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Plot No. 42, Phase 1, Hinjewadi IT Park,
                      <br />
                      Near Wipro Circle, Hinjewadi,
                      <br />
                      Pune, Maharashtra - 411057
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
                      Visiting Hours
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Monday - Saturday: 9:00 AM - 7:00 PM
                      <br />
                      Sunday: 10:00 AM - 5:00 PM
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                      Phone
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      <a
                        href="tel:+919922538989"
                        className="hover:text-pink-500 transition-colors"
                      >
                        +91 9922 538 989
                      </a>
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                      Email
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      info@comfortstay.in
                      <br />
                      bookings@comfortstay.in
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-96 md:h-[450px] bg-gray-200 dark:bg-gray-700 rounded-2xl overflow-hidden shadow-md">
              <div className="w-full h-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-pink-300 dark:text-pink-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-pink-50/50 dark:bg-pink-900/5 rounded-3xl">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
            How to Reach Us
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Our brand new Comfort Stay PG is easily accessible via various
            transportation options from different parts of Pune.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-md hover:shadow-lg transition border border-pink-100 dark:border-pink-900/20">
              <div className="w-14 h-14 mb-6 rounded-xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-pink-500 dark:text-pink-400"
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
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                From Pune Railway Station
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 space-y-2 list-disc pl-5">
                <li>Take bus number 115 to Hinjewadi Phase 1</li>
                <li>Auto-rickshaws and cabs are readily available</li>
                <li>Approximate travel time: 45-60 minutes</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-md hover:shadow-lg transition border border-pink-100 dark:border-pink-900/20">
              <div className="w-14 h-14 mb-6 rounded-xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-pink-500 dark:text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                From Pune Airport
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 space-y-2 list-disc pl-5">
                <li>Pre-paid taxi service available at the airport</li>
                <li>Cab services like Uber/Ola are convenient options</li>
                <li>Approximate travel time: 45-60 minutes</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-md hover:shadow-lg transition border border-pink-100 dark:border-pink-900/20">
              <div className="w-14 h-14 mb-6 rounded-xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-pink-500 dark:text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                From Nearby Landmarks
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 space-y-2 list-disc pl-5">
                <li>5 mins from Wipro Circle</li>
                <li>10 mins from Infosys Campus</li>
                <li>15 mins from Hinjewadi Phase 2</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-8 shadow-md border border-pink-100 dark:border-pink-900/20">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
              Schedule a Visit or Pre-Book Your Stay
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
              Interested in our brand new PG opened in March 2025? Fill out the
              form below to schedule a visit or pre-book your 2 or 3 sharing
              accommodation.
            </p>

            <form className="space-y-6 max-w-3xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="accommodation"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Preferred Accommodation
                </label>
                <select
                  id="accommodation"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option>2 Sharing Room</option>
                  <option>3 Sharing Room</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="visit-date"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Preferred Visit Date
                  </label>
                  <input
                    type="date"
                    id="visit-date"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="visit-time"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Preferred Time
                  </label>
                  <select
                    id="visit-time"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option>9:00 AM - 11:00 AM</option>
                    <option>11:00 AM - 1:00 PM</option>
                    <option>2:00 PM - 4:00 PM</option>
                    <option>4:00 PM - 6:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Additional Information or Requirements
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                ></textarea>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
