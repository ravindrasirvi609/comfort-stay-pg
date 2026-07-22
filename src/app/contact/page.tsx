import type { Metadata } from "next";
import { Train, Plane, Bus } from "lucide-react";
import PageHero from "@/components/PageHero";
import ContactV2 from "@/components/marketing/ContactV2";
import LocationV2 from "@/components/marketing/LocationV2";
import VisitForm from "@/components/VisitForm";

export const metadata: Metadata = {
  title: "Contact Us - Comfort Stay PG | Best Girls PG in Hinjewadi Phase 1",
  description:
    "Contact Comfort Stay PG in Hinjewadi Phase 1, Pune. New premium accommodation for women opened July 2025. Call us at 9922538989 to book your stay today.",
  keywords:
    "girls PG Hinjewadi, ladies PG Pune, Comfort Stay PG contact, Hinjewadi Phase 1 PG, working women accommodation Pune, affordable PG Hinjewadi, new PG Hinjewadi 2025",
  alternates: {
    canonical: "https://www.comfortstaypg.com/contact",
  },
  openGraph: {
    title: "Contact Comfort Stay PG - New Premium Girls PG in Hinjewadi",
    description:
      "Brand new PG accommodation opened July 2025 with 2 & 3 sharing options. Contact us at 9922538989 for bookings and inquiries.",
    type: "website",
  },
};

const commute = [
  {
    icon: Train,
    title: "From Pune Railway Station",
    items: [
      "Bus 115 to Hinjewadi Phase 1",
      "Auto & cabs readily available",
      "≈ 45–60 min",
    ],
  },
  {
    icon: Plane,
    title: "From Pune Airport",
    items: [
      "Pre-paid taxi at the airport",
      "Uber / Ola cabs available",
      "≈ 45–60 min",
    ],
  },
  {
    icon: Bus,
    title: "From Nearby Landmarks",
    items: [
      "5 min from Wipro Circle",
      "10 min from Infosys Campus",
      "15 min from Hinjewadi Phase 2",
    ],
  },
];

export default function ContactPage() {
  return (
    <div>
      <PageHero
        eyebrow="Contact us"
        title="Let's find your perfect stay."
        description="Bookings, tours, or just a quick question — we're here for you."
        breadcrumb={[{ label: "Contact" }]}
      />
      <ContactV2 />
      <LocationV2 />

      {/* How to reach */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              How to reach us
            </h2>
            <p className="text-gray-600 dark:text-pink-100/70">
              Well-connected via road, rail, and air.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            {commute.map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className="rounded-3xl border border-pink-100/60 dark:border-pink-900/40 bg-white/70 dark:bg-pink-950/25 backdrop-blur-xl p-6 hover:shadow-lg hover:shadow-pink-500/10 transition-all"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    {c.title}
                  </h3>
                  <ul className="space-y-1.5 text-sm text-gray-600 dark:text-pink-100/70">
                    {c.items.map((it, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pink-500 shrink-0" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visit / booking form */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="rounded-3xl border border-pink-100/60 dark:border-pink-900/40 bg-white/80 dark:bg-pink-950/25 backdrop-blur-xl p-6 md:p-9 shadow-lg shadow-pink-500/10">
            <div className="text-center mb-6">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Schedule a Visit
              </h2>
              <p className="text-gray-600 dark:text-pink-100/70 text-sm">
                Fill out the form and we&apos;ll arrange a personal tour.
              </p>
            </div>
            <VisitForm />
          </div>
        </div>
      </section>
    </div>
  );
}
