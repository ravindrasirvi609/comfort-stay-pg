import { Metadata } from "next";
import SEOHead from "@/components/SEOHead";

// Define FAQ page metadata
export const metadata: Metadata = {
  title: "Frequently Asked Questions | Comfort Stay PG",
  description:
    "Find answers to common questions about Comfort Stay PG in Hinjawadi, Pune. Learn about our amenities, room options, pricing, booking process, and more.",
  alternates: {
    canonical: "https://www.comfortstaypg.com/faqs",
  },
  openGraph: {
    title: "Frequently Asked Questions | Comfort Stay PG",
    description:
      "Find answers to common questions about Comfort Stay PG in Hinjawadi, Pune.",
    url: "https://www.comfortstaypg.com/faqs",
  },
};

export default function FAQs() {
  // FAQ data that matches the schema in SEOHead
  const faqItems = [
    {
      question: "What amenities are included in Comfort Stay PG?",
      answer:
        "Comfort Stay PG offers high-speed WiFi, nutritious meals three times a day, 24/7 hot water, comfortable beds, enhanced security with female guards and CCTV, secure parking, laundry services, flexible timings with digital access, entertainment areas, common kitchen, study room, and more.",
    },
    {
      question: "What are the room options and pricing at Comfort Stay PG?",
      answer:
        "We offer two room types: Triple Sharing at ₹8,000/month and Twin Sharing at ₹9,500/month. All rooms include meals, electricity, water, WiFi, and housekeeping services. Our rooms feature brand new furnishings, personal storage, and attached bathrooms.",
    },
    {
      question: "Where is Comfort Stay PG located?",
      answer:
        "Comfort Stay PG is located at Hinjewadi Phase 1 Rd, Mukai Nagar, Phase 1, Hinjawadi Rajiv Gandhi Infotech Park, Hinjawadi, Pune, Maharashtra 411057. We're within 5 minutes walking distance to Hinjawadi IT Park.",
    },
    {
      question: "Is there a curfew at Comfort Stay PG?",
      answer:
        "Comfort Stay PG offers flexible timings with no strict curfew. We provide secure digital access for residents to ensure safety while allowing independence.",
    },
    {
      question: "How can I book a room at Comfort Stay PG?",
      answer:
        "You can book a room by contacting us at +91 9922 538 989 or emailing us at info@comfortstay.com. You can also visit our contact page at www.comfortstaypg.com/contact to submit an inquiry form.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <SEOHead type="faq" />

      <h1 className="comfort-header text-3xl md:text-4xl font-bold mb-8 text-center mt-4">
        Frequently Asked Questions
      </h1>

      <p className="text-center mb-10 text-gray-700 dark:text-gray-300">
        Find answers to common questions about our PG accommodation
      </p>

      <div className="space-y-6 mb-12">
        {faqItems.map((faq, index) => (
          <div key={index} className="card p-6">
            <h2 className="text-xl font-semibold mb-3 text-pink-600 dark:text-pink-400">
              {faq.question}
            </h2>
            <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="card p-6 mb-12">
        <h2 className="text-xl font-semibold mb-3 text-pink-600 dark:text-pink-400">
          Still have questions?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          We're here to help. Contact us directly for more information.
        </p>
        <a
          href="/contact"
          className="bg-pink-600 hover:bg-pink-700 transition-colors text-white py-2 px-6 rounded-lg inline-block"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
