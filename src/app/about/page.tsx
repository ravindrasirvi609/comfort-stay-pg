import type { Metadata } from "next";
import { Zap, ShieldCheck, Users, Clock, MapPin, Sparkles, Home } from "lucide-react";
import PageHero from "@/components/PageHero";
import AboutV2 from "@/components/marketing/AboutV2";
import StatsStrip from "@/components/marketing/StatsStrip";
import CTASection from "@/components/marketing/CTASection";

export const metadata: Metadata = {
  title: "About Us - Comfort Stay PG | New Girls PG in Hinjewadi Phase 1",
  description:
    "Learn about Comfort Stay PG, a brand new girls accommodation in Hinjewadi Phase 1, Pune, opened July 2025. Offering comfortable 2 & 3 sharing rooms for working women and students.",
  keywords:
    "new girls PG Hinjewadi 2025, ladies accommodation Pune, affordable PG Hinjewadi, 2 sharing rooms, 3 sharing PG, working women PG, student accommodation Hinjewadi",
  alternates: {
    canonical: "https://www.comfortstaypg.com/about",
  },
  openGraph: {
    title: "About Comfort Stay PG - New Girls Accommodation in Hinjewadi",
    description:
      "Brand new PG opened July 2025 with premium 2 & 3 sharing rooms in Hinjewadi Phase 1, Pune. Designed specifically for working women and students.",
    type: "website",
  },
};

const pillars = [
  {
    icon: Zap,
    title: "Our Mission",
    text: "To provide a safe, comfortable, and supportive living environment that feels like a home away from home for young women.",
  },
  {
    icon: ShieldCheck,
    title: "Our Values",
    text: "Safety, comfort, respect, community, and excellence in everything we do to help our residents thrive.",
  },
  {
    icon: Users,
    title: "Our Team",
    text: "Dedicated professionals committed to creating a positive, nurturing environment for every resident.",
  },
];

const highlights = [
  {
    icon: MapPin,
    title: "Prime Location",
    text: "Located in Hinjewadi Phase 1, walking distance to Rajiv Gandhi Infotech Park.",
  },
  {
    icon: ShieldCheck,
    title: "Security First",
    text: "24/7 CCTV, guards, and secure entry — designed for women's safety.",
  },
  {
    icon: Sparkles,
    title: "Modern Amenities",
    text: "High-speed WiFi, power backup, laundry, meals and more — all included.",
  },
  {
    icon: Clock,
    title: "Flexible Terms",
    text: "Short and long-term stays with flexible payment options.",
  },
  {
    icon: Home,
    title: "Brand New Building",
    text: "Freshly built and opened July 2025. Be among the first residents.",
  },
  {
    icon: Users,
    title: "Women-Only Community",
    text: "Exclusively for working women and female students — always.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <PageHero
        eyebrow="About us"
        title="A brand-new home for the modern woman."
        description="Comfort Stay PG is an exclusive, premium accommodation for working women and students in Hinjewadi Phase 1 — opened July 2025."
        breadcrumb={[{ label: "About" }]}
      />

      {/* Reuses homepage About */}
      <AboutV2 />

      {/* Three-column pillars */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className="rounded-3xl border border-pink-100/60 dark:border-pink-900/40 bg-white/70 dark:bg-pink-950/25 backdrop-blur-xl p-6 md:p-7 shadow-sm hover:shadow-lg hover:shadow-pink-500/10 transition-all text-center"
              >
                <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25">
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-pink-100/70 leading-relaxed">
                  {p.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <StatsStrip />

      {/* Highlights */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
              What sets us apart
            </h2>
            <p className="text-gray-600 dark:text-pink-100/70">
              Features that make Comfort Stay the preferred choice for women in
              Hinjewadi.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-3xl border border-pink-100/60 dark:border-pink-900/40 bg-white/70 dark:bg-pink-950/25 backdrop-blur-xl p-6 hover:shadow-lg hover:shadow-pink-500/10 transition-all"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {h.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-pink-100/70 leading-relaxed">
                    {h.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
