"use client";

import Script from "next/script";

interface SEOHeadProps {
  type: "homepage" | "about" | "facilities" | "contact" | "faq";
}

const SEOHead = ({ type }: SEOHeadProps) => {
  // FAQ structured data for better search results
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What amenities are included in Comfort Stay PG?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Comfort Stay PG offers high-speed WiFi, nutritious meals three times a day, 24/7 hot water, comfortable beds, enhanced security with female guards and CCTV, secure parking, laundry services, flexible timings with digital access, entertainment areas, common kitchen, study room, and more.",
        },
      },
      {
        "@type": "Question",
        name: "What are the room options and pricing at Comfort Stay PG?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We offer two room types: Triple Sharing at ₹8,000/month and Twin Sharing at ₹9,500/month. All rooms include meals, electricity, water, WiFi, and housekeeping services. Our rooms feature brand new furnishings, personal storage, and attached bathrooms.",
        },
      },
      {
        "@type": "Question",
        name: "Where is Comfort Stay PG located?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Comfort Stay PG is located at Hinjewadi Phase 1 Rd, Mukai Nagar, Phase 1, Hinjawadi Rajiv Gandhi Infotech Park, Hinjawadi, Pune, Maharashtra 411057. We're within 5 minutes walking distance to Hinjawadi IT Park.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a curfew at Comfort Stay PG?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Comfort Stay PG offers flexible timings with no strict curfew. We provide secure digital access for residents to ensure safety while allowing independence.",
        },
      },
      {
        "@type": "Question",
        name: "How can I book a room at Comfort Stay PG?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can book a room by contacting us at +91 9922 538 989 or emailing us at info@comfortstay.com. You can also visit our contact page at www.comfortstaypg.com/contact to submit an inquiry form.",
        },
      },
    ],
  };

  // Review aggregate structured data
  const reviewData = {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    itemReviewed: {
      "@type": "LodgingBusiness",
      name: "Comfort Stay PG",
      image: "https://www.comfortstaypg.com/images/comfort-stay-building.jpg",
    },
    ratingValue: "4.8",
    bestRating: "5",
    worstRating: "1",
    ratingCount: "32",
  };

  // Choose which structured data to include based on page type
  const getStructuredData = () => {
    switch (type) {
      case "homepage":
        return (
          <>
            <Script
              id="homepage-review-schema"
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewData) }}
            />
          </>
        );
      case "faq":
        return (
          <Script
            id="faq-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
          />
        );
      default:
        return null;
    }
  };

  return getStructuredData();
};

export default SEOHead;
