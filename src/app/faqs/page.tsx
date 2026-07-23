import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import FAQAccordion, { faqs } from "@/components/marketing/FAQAccordion";
import CTASection from "@/components/marketing/CTASection";
import { FAQSchema } from "@/components/StructuredData";

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

export default function FAQsPage() {
  return (
    <div>
      <FAQSchema items={faqs} />
      <PageHero
        eyebrow="FAQs"
        title="Everything you'd like to know."
        description="Answers to the most common questions about rooms, pricing, security, and booking."
        breadcrumb={[{ label: "FAQs" }]}
      />
      <FAQAccordion />
      <CTASection />
    </div>
  );
}
