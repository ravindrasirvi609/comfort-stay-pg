"use client";

import Script from "next/script";

// JSON-LD structured data for local business
const LocalBusinessSchema = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Comfort Stay PG",
    description:
      "Premium girls' PG accommodation in Hinjawadi, Pune with modern amenities, nutritious meals, and 24/7 security.",
    url: "https://www.comfortstaypg.com",
    telephone: "+91 9922 538 989",
    email: "info@comfortstay.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Hinjewadi Phase 1 Rd, Mukai Nagar, Phase 1",
      addressLocality: "Hinjawadi Rajiv Gandhi Infotech Park",
      addressRegion: "Maharashtra",
      postalCode: "411057",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "18.595507", // Update with actual coordinates
      longitude: "73.730114", // Update with actual coordinates
    },
    priceRange: "₹8,000 - ₹9,500",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
    amenityFeature: [
      {
        "@type": "LocationFeatureSpecification",
        name: "High-Speed WiFi",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Nutritious Meals",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Hot Water 24/7",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Enhanced Security",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Laundry Service",
        value: true,
      },
    ],
    image: [
      "https://www.comfortstaypg.com/images/comfort-stay-building.jpg",
      "https://www.comfortstaypg.com/images/comfort-stay-room.jpg",
      "https://www.comfortstaypg.com/images/comfort-stay-dining.jpg",
    ],
    maximumAttendeeCapacity: "50",
    audience: {
      "@type": "PeopleAudience",
      audienceType: "Working Women and Female Students",
    },
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.comfortstaypg.com/contact",
        inLanguage: "en-IN",
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      result: {
        "@type": "LodgingReservation",
        name: "Room Booking",
      },
    },
  };

  return (
    <Script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default LocalBusinessSchema;
