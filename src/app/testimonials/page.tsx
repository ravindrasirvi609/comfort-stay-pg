import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import TestimonialsCarousel from "@/components/marketing/TestimonialsCarousel";
import CTASection from "@/components/marketing/CTASection";

export const metadata: Metadata = {
  title: "Testimonials - Comfort Stay PG | What Our Residents Say",
  description:
    "Read what our residents say about their experience at Comfort Stay PG in Hinjewadi Phase 1, Pune. Real stories from working women and students.",
  alternates: {
    canonical: "https://www.comfortstaypg.com/testimonials",
  },
  openGraph: {
    title: "Testimonials - Comfort Stay PG",
    description:
      "Real stories from women who call Comfort Stay PG home in Hinjewadi Phase 1, Pune.",
    type: "website",
  },
};

export default function TestimonialsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Testimonials"
        title="Real stories, real smiles."
        description="Hear from the amazing women who chose Comfort Stay as their home."
        breadcrumb={[{ label: "Testimonials" }]}
      />
      <TestimonialsCarousel />
      <CTASection />
    </div>
  );
}
