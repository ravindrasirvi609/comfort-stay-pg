import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import AmenitiesV2 from "@/components/marketing/AmenitiesV2";
import RoomsV2 from "@/components/marketing/RoomsV2";
import FeatureMarquee from "@/components/marketing/FeatureMarquee";
import CTASection from "@/components/marketing/CTASection";
import { RoomProductSchema } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Facilities - Comfort Stay PG | Best Girls PG in Hinjewadi Phase 1",
  description:
    "Discover our modern facilities at Comfort Stay PG in Hinjewadi Phase 1, Pune. Brand new building with comfortable 2 & 3 sharing rooms opened July 2025.",
  keywords:
    "girls PG facilities Hinjewadi, ladies PG amenities Pune, 2 sharing PG rooms, 3 sharing accommodation, Comfort Stay facilities, new PG Hinjewadi 2025",
  alternates: {
    canonical: "https://www.comfortstaypg.com/facilities",
  },
  openGraph: {
    title: "Modern Facilities at Comfort Stay PG - New Girls PG in Hinjewadi",
    description:
      "Brand new PG accommodation with premium 2 & 3 sharing rooms, high-speed WiFi, nutritious meals, and 24/7 security. Opened July 2025.",
    type: "website",
  },
};

export default function FacilitiesPage() {
  return (
    <div>
      <RoomProductSchema />
      <PageHero
        eyebrow="Our facilities"
        title="Every amenity crafted for you."
        description="From meals to WiFi to housekeeping — everything you need is thoughtfully included."
        breadcrumb={[{ label: "Facilities" }]}
      />
      <FeatureMarquee />
      <AmenitiesV2 />
      <RoomsV2 />
      <CTASection />
    </div>
  );
}
