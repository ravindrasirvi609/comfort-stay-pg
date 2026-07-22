import HeroV2 from "@/components/marketing/HeroV2";
import FeatureMarquee from "@/components/marketing/FeatureMarquee";
import AboutV2 from "@/components/marketing/AboutV2";
import StatsStrip from "@/components/marketing/StatsStrip";
import AmenitiesV2 from "@/components/marketing/AmenitiesV2";
import RoomsV2 from "@/components/marketing/RoomsV2";
import GalleryV2 from "@/components/marketing/GalleryV2";
import LocationV2 from "@/components/marketing/LocationV2";
import TestimonialsCarousel from "@/components/marketing/TestimonialsCarousel";
import CTASection from "@/components/marketing/CTASection";
import ContactV2 from "@/components/marketing/ContactV2";
import SEOHead from "@/components/SEOHead";
import { RoomProductSchema } from "@/components/StructuredData";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comfort Stay PG - Premium Girls PG Accommodation in Hinjawadi, Pune",
  description:
    "Discover the perfect girls' PG accommodation at Comfort Stay PG in Hinjawadi Phase 1, Pune. Enjoy premium amenities including high-speed WiFi, nutritious meals, 24/7 security, and modern facilities. Ideal for working women and students near IT Park.",
  alternates: {
    canonical: "https://www.comfortstaypg.com",
  },
  openGraph: {
    title: "Comfort Stay PG - Premium Girls PG in Hinjawadi, Pune",
    description:
      "Discover the perfect girls' PG accommodation at Comfort Stay PG in Hinjawadi Phase 1, Pune with premium amenities.",
    url: "https://www.comfortstaypg.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Comfort Stay PG Hinjawadi Pune",
      },
    ],
  },
};

export default function Home() {
  return (
    <div>
      <SEOHead type="homepage" />
      <RoomProductSchema />
      <HeroV2 />
      <FeatureMarquee />
      <AboutV2 />
      <StatsStrip />
      <AmenitiesV2 />
      <RoomsV2 />
      <CTASection />
      <GalleryV2 />
      <LocationV2 />
      <TestimonialsCarousel />
      <ContactV2 />
    </div>
  );
}
