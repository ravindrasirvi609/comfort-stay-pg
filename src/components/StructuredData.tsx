"use client";

import Script from "next/script";

const siteUrl = "https://www.comfortstaypg.com";

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Comfort Stay PG",
  url: siteUrl,
  logo: `${siteUrl}/apple-touch-icon.png`,
  sameAs: [] as string[],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-9922-538-989",
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: ["en", "hi"],
  },
};

const rooms = [
  {
    name: "Triple Sharing Room — Comfort Stay PG",
    description:
      "Brand new triple-sharing room with attached bathroom, personal cupboard, WiFi, and premium bedding. Includes 3 meals, housekeeping, WiFi, water and electricity.",
    price: "8500",
    image: `${siteUrl}/gallery/3sharing.jpg`,
    url: `${siteUrl}/rooms/triple-sharing`,
  },
  {
    name: "Twin Sharing Room — Comfort Stay PG",
    description:
      "Brand new twin-sharing room with attached bathroom, larger cupboards, WiFi, and premium bedding. Includes 3 meals, housekeeping, WiFi, water and electricity.",
    price: "10000",
    image: `${siteUrl}/gallery/2sharing.jpg`,
    url: `${siteUrl}/rooms/twin-sharing`,
  },
];

const productSchema = {
  "@context": "https://schema.org",
  "@graph": rooms.map((r) => ({
    "@type": "Product",
    name: r.name,
    description: r.description,
    image: r.image,
    url: r.url,
    brand: { "@type": "Brand", name: "Comfort Stay PG" },
    offers: {
      "@type": "Offer",
      price: r.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      priceValidUntil: "2026-12-31",
      url: r.url,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "32",
    },
  })),
};

export function OrganizationSchema() {
  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
    />
  );
}

export function RoomProductSchema() {
  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  );
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
  return (
    <Script
      id={`breadcrumb-${items.map((i) => i.name).join("-")}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
