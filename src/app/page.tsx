import Hero from "@/components/Hero";
import About from "@/components/About";
import Amenities from "@/components/Amenities";
import Rooms from "@/components/Rooms";
import Gallery from "@/components/Gallery";
import Location from "@/components/Location";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import SEOHead from "@/components/SEOHead";
import { Metadata } from "next";

// Override default metadata for homepage
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
    <div className="space-y-20">
      <SEOHead type="homepage" />
      <Hero />
      <About />
      <Amenities />
      <Rooms />
      <Gallery />
      <Location />
      <Testimonials />
      <Contact />
    </div>
  );
}
