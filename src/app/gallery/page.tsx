import Gallery from "@/components/Gallery";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery - Comfort Stay PG | Premium Girls PG in Hinjewadi",
  description:
    "View our gallery showcasing the premium facilities, rooms, and common areas at Comfort Stay PG in Hinjewadi, Pune.",
};

export default function GalleryPage() {
  return (
    <div className="space-y-16">
      <section className="py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-pink-700 dark:from-pink-400 dark:to-pink-600">
            Our Gallery
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Explore our visual collection showcasing our premium accommodations,
            facilities, and the welcoming environment at Comfort Stay PG.
          </p>
        </div>
      </section>

      <Gallery />
      {/* TODO : This will Do later  */}
      {/* <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
            Virtual Tour Experience
          </h2>

          <div className="bg-pink-50/50 dark:bg-pink-900/5 rounded-3xl p-8 md:p-12 text-center">
            <div className="w-24 h-24 mx-auto bg-white dark:bg-gray-800/60 rounded-full flex items-center justify-center mb-8 shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-pink-500 dark:text-pink-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
              Experience Comfort Stay PG in 360°
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Take a virtual tour of our facilities and get a real feel of the
              space before your visit. Explore rooms, common areas, and
              amenities from the comfort of your home.
            </p>
            <button className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-full font-medium hover:from-pink-600 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Start Virtual Tour
            </button>
          </div>
        </div>
      </section> */}

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
            Photo Categories
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative overflow-hidden rounded-2xl group cursor-pointer h-60">
              <div className="absolute inset-0 bg-gradient-to-t from-pink-600/80 to-pink-600/20 opacity-50 group-hover:opacity-70 transition-opacity duration-300 z-10"></div>
              <div className="absolute inset-0 bg-gray-900/30 z-0"></div>
              <div className="h-full w-full bg-pink-100 dark:bg-pink-900/50"></div>
              <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
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
                <h3 className="text-xl font-bold text-white mb-1">Rooms</h3>
                <p className="text-white/80 text-sm">View all room types</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl group cursor-pointer h-60">
              <div className="absolute inset-0 bg-gradient-to-t from-pink-600/80 to-pink-600/20 opacity-50 group-hover:opacity-70 transition-opacity duration-300 z-10"></div>
              <div className="absolute inset-0 bg-gray-900/30 z-0"></div>
              <div className="h-full w-full bg-pink-100 dark:bg-pink-900/50"></div>
              <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Common Areas
                </h3>
                <p className="text-white/80 text-sm">Explore shared spaces</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl group cursor-pointer h-60">
              <div className="absolute inset-0 bg-gradient-to-t from-pink-600/80 to-pink-600/20 opacity-50 group-hover:opacity-70 transition-opacity duration-300 z-10"></div>
              <div className="absolute inset-0 bg-gray-900/30 z-0"></div>
              <div className="h-full w-full bg-pink-100 dark:bg-pink-900/50"></div>
              <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Amenities</h3>
                <p className="text-white/80 text-sm">Discover our facilities</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl group cursor-pointer h-60">
              <div className="absolute inset-0 bg-gradient-to-t from-pink-600/80 to-pink-600/20 opacity-50 group-hover:opacity-70 transition-opacity duration-300 z-10"></div>
              <div className="absolute inset-0 bg-gray-900/30 z-0"></div>
              <div className="h-full w-full bg-pink-100 dark:bg-pink-900/50"></div>
              <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
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
                <h3 className="text-xl font-bold text-white mb-1">
                  Surroundings
                </h3>
                <p className="text-white/80 text-sm">View the neighborhood</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-pink-50/50 dark:bg-pink-900/5 rounded-3xl">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-white">
            Request a Personal Tour
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Nothing beats seeing it in person! Schedule a visit to experience
            the comfort and facilities firsthand.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-full font-medium hover:from-pink-600 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg w-full md:w-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
              Schedule a Visit
            </button>

            <button className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-900/30 px-6 py-3 rounded-full font-medium hover:bg-pink-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-sm hover:shadow w-full md:w-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
