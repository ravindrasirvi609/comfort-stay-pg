import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import GalleryV2 from "@/components/marketing/GalleryV2";
import CTASection from "@/components/marketing/CTASection";

export const metadata: Metadata = {
  title: "Gallery - Comfort Stay PG | Premium Girls PG in Hinjewadi",
  description:
    "View our gallery showcasing the premium facilities, rooms, and common areas at Comfort Stay PG in Hinjewadi, Pune.",
  alternates: {
    canonical: "https://www.comfortstaypg.com/gallery",
  },
  openGraph: {
    title: "Gallery - Comfort Stay PG",
    description:
      "Explore rooms, dining, common areas & building — Comfort Stay PG, Hinjewadi Phase 1.",
    type: "website",
  },
};

export default function GalleryPage() {
  return (
    <div>
      <PageHero
        eyebrow="Gallery"
        title="A picture is worth a thousand words."
        description="Explore rooms, dining halls, and common areas — visualize your next stay."
        breadcrumb={[{ label: "Gallery" }]}
      />
      <GalleryV2 />
      <CTASection />
    </div>
  );
}
