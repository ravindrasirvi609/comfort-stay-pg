import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rules & Regulations - Comfort Stay PG | Hinjewadi Phase 1",
  description:
    "Rules and regulations for residents of Comfort Stay PG, Hinjewadi Phase 1, Pune — covering general conduct, visitors, safety, facilities, payments, and check-out.",
  alternates: {
    canonical: "https://www.comfortstaypg.com/rules-regulations",
  },
  openGraph: {
    title: "Rules & Regulations - Comfort Stay PG",
    description:
      "Guidelines for residents at Comfort Stay PG in Hinjewadi Phase 1, Pune.",
    url: "https://www.comfortstaypg.com/rules-regulations",
    type: "website",
  },
};

export default function RulesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
