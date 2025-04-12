import Testimonials from "@/components/Testimonials";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimonials - Comfort Stay PG | Premium Girls PG in Hinjewadi",
  description:
    "Read what our residents say about their experience at Comfort Stay PG in Hinjewadi, Pune. Discover why we're the preferred choice for women's accommodation.",
};

export default function TestimonialsPage() {
  return (
    <div className="space-y-16">
      <section className="py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-pink-700 dark:from-pink-400 dark:to-pink-600">
            Testimonials
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover what our residents have to say about their experience
            living at Comfort Stay PG. Their stories speak volumes about our
            commitment to quality.
          </p>
        </div>
      </section>

      <Testimonials />

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
            Featured Reviews
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-8 shadow-md hover:shadow-lg transition border border-pink-100 dark:border-pink-900/20 relative">
              <div className="absolute top-6 right-8 text-pink-100 dark:text-pink-900/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z" />
                </svg>
              </div>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 overflow-hidden flex items-center justify-center">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Priya Sharma
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Software Engineer, Infosys
                  </p>
                </div>
              </div>
              <div className="flex mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 relative z-10">
                &ldquo;Moving to Pune for my job was initially intimidating, but
                finding Comfort Stay PG was a blessing. The security,
                cleanliness, and warm community have made it feel like home. The
                location is perfect for my office commute, and the facilities
                exceed my expectations. Highly recommended!&rdquo;
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Resident since March 2023
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-8 shadow-md hover:shadow-lg transition border border-pink-100 dark:border-pink-900/20 relative">
              <div className="absolute top-6 right-8 text-pink-100 dark:text-pink-900/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z" />
                </svg>
              </div>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 overflow-hidden flex items-center justify-center">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Aisha Patel
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    UX Designer, TCS
                  </p>
                </div>
              </div>
              <div className="flex mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 relative z-10">
                &ldquo;I&apos;ve lived in several PGs before, but Comfort Stay
                stands out in every aspect. The homemade food is delicious, the
                staff is supportive, and my room is spacious and
                well-maintained. The high-speed internet has been crucial for my
                work. This place truly understands the needs of working
                women.&rdquo;
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Resident since August 2022
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-pink-50 to-pink-100/50 dark:from-gray-800/50 dark:to-pink-900/10 rounded-3xl">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800 dark:text-white">
            Our Satisfaction Metrics
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            We constantly measure and improve our service quality based on
            resident feedback.
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800/60 shadow-md flex items-center justify-center mx-auto mb-6">
                <div className="text-3xl font-bold text-pink-500 dark:text-pink-400">
                  98%
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                Satisfaction Rate
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Overall resident satisfaction with their living experience
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800/60 shadow-md flex items-center justify-center mx-auto mb-6">
                <div className="text-3xl font-bold text-pink-500 dark:text-pink-400">
                  95%
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                Safety Rating
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Residents who feel completely safe and secure
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800/60 shadow-md flex items-center justify-center mx-auto mb-6">
                <div className="text-3xl font-bold text-pink-500 dark:text-pink-400">
                  4.8
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                Food Quality
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Average rating for our homemade nutritious meals
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800/60 shadow-md flex items-center justify-center mx-auto mb-6">
                <div className="text-3xl font-bold text-pink-500 dark:text-pink-400">
                  92%
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                Would Recommend
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Residents who would recommend us to friends
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
            Share Your Experience
          </h2>

          <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-8 shadow-md border border-pink-100 dark:border-pink-900/20">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center">
              Are you a current or past resident? We&apos;d love to hear about
              your experience at Comfort Stay PG!
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
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Stay Duration
                </label>
                <select
                  id="duration"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option>Less than 6 months</option>
                  <option>6 months - 1 year</option>
                  <option>1 - 2 years</option>
                  <option>More than 2 years</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="rating"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Overall Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-pink-500 dark:text-pink-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="testimonial"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Your Experience
                </label>
                <textarea
                  id="testimonial"
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                ></textarea>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Submit Your Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
