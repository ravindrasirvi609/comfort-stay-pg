"use client";

import { motion } from "framer-motion";
import {
  Wifi,
  Utensils,
  ShowerHead,
  Bed,
  Tv,
  ParkingSquare,
  Shirt,
  Shield,
  Coffee,
  Clock,
} from "lucide-react";
import BlurText from "../BlurText";
import { cn } from "@/lib/utils";

interface Item {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  span: string; // tailwind span class
  accent?: string; // gradient
}

const items: Item[] = [
  {
    icon: Wifi,
    title: "Blazing WiFi",
    description: "Fibre-optic internet in every corner, every room.",
    span: "md:col-span-2 md:row-span-2",
    accent: "from-pink-500/90 via-rose-500/90 to-fuchsia-500/90",
  },
  {
    icon: Utensils,
    title: "Homely Meals",
    description: "3 nutritious meals — chef curated.",
    span: "md:col-span-2",
  },
  {
    icon: Shield,
    title: "24/7 Security",
    description: "CCTV + guards, always.",
    span: "",
  },
  {
    icon: ShowerHead,
    title: "Hot Water",
    description: "Round-the-clock supply.",
    span: "",
  },
  {
    icon: Bed,
    title: "Premium Beds",
    description: "Ortho-friendly mattresses.",
    span: "md:col-span-2",
  },
  {
    icon: Clock,
    title: "Flexible Timings",
    description: "No strict curfews.",
    span: "",
  },
  {
    icon: ParkingSquare,
    title: "Secure Parking",
    description: "Well-lit, monitored space.",
    span: "",
  },
  {
    icon: Shirt,
    title: "Laundry",
    description: "Self-service washing & drying.",
    span: "",
  },
  {
    icon: Tv,
    title: "Smart Lounge",
    description: "Smart TV + rec. area.",
    span: "",
  },
  {
    icon: Coffee,
    title: "Common Kitchen",
    description: "Fully equipped, cook anytime.",
    span: "md:col-span-2",
  },
];

export default function AmenitiesV2() {
  return (
    <section id="amenities" className="py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="eyebrow mb-4 justify-center">
            <span className="inline-block w-8 h-px bg-pink-500" /> Amenities
            <span className="inline-block w-8 h-px bg-pink-500" />
          </div>
          <BlurText
            as="h2"
            text="Everything you need, thoughtfully included."
            className="font-display text-[clamp(2rem,3.5vw,3.25rem)] font-bold leading-[1.08] tracking-tight text-gray-900 dark:text-white mb-4"
          />
          <p className="text-gray-600 dark:text-pink-100/70">
            From lightning-fast WiFi to homely meals — every detail is designed
            for your comfort and productivity.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[140px] md:auto-rows-[160px] gap-3 md:gap-4">
          {items.map((it, i) => {
            const Icon = it.icon;
            const featured = i === 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                className={cn(
                  "group relative overflow-hidden rounded-3xl border p-5 backdrop-blur-xl transition-all",
                  featured
                    ? "text-white shadow-xl shadow-pink-500/25 border-transparent"
                    : "border-pink-100/60 dark:border-pink-900/40 bg-white/70 dark:bg-pink-950/25 hover:shadow-lg hover:shadow-pink-500/10",
                  it.span
                )}
              >
                {featured && (
                  <>
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br",
                        it.accent
                      )}
                    />
                    <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/25 blur-3xl" />
                    <div className="noise opacity-30" />
                  </>
                )}
                <div className="relative h-full flex flex-col justify-between">
                  <div
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-2xl",
                      featured
                        ? "bg-white/20 backdrop-blur text-white"
                        : "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25"
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3
                      className={cn(
                        "font-bold mb-1",
                        featured
                          ? "text-white text-lg md:text-xl"
                          : "text-gray-900 dark:text-white"
                      )}
                    >
                      {it.title}
                    </h3>
                    <p
                      className={cn(
                        "text-xs md:text-sm leading-snug",
                        featured
                          ? "text-white/90"
                          : "text-gray-600 dark:text-pink-100/70"
                      )}
                    >
                      {it.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
