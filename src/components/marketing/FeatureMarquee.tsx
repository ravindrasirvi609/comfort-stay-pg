"use client";

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
  Sparkles,
  Zap,
} from "lucide-react";

const items = [
  { icon: Wifi, label: "High-Speed WiFi" },
  { icon: Utensils, label: "3 Meals a Day" },
  { icon: ShowerHead, label: "24/7 Hot Water" },
  { icon: Bed, label: "Comfy Beds" },
  { icon: Shield, label: "CCTV + Guards" },
  { icon: ParkingSquare, label: "Secure Parking" },
  { icon: Shirt, label: "Laundry" },
  { icon: Clock, label: "Flexible Timings" },
  { icon: Tv, label: "Smart Lounge" },
  { icon: Coffee, label: "Common Kitchen" },
  { icon: Sparkles, label: "Housekeeping" },
  { icon: Zap, label: "Backup Power" },
];

// double for seamless loop
const track = [...items, ...items];

export default function FeatureMarquee() {
  return (
    <section
      className="relative py-6 md:py-8 overflow-hidden"
      aria-label="Amenities marquee"
    >
      <div className="mask-fade-x">
        <div className="flex w-max animate-marquee gap-4 will-change-transform">
          {track.map((it, i) => {
            const Icon = it.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-full border border-pink-100/70 dark:border-pink-900/50 bg-white/60 dark:bg-pink-950/25 backdrop-blur px-5 py-2.5 shadow-sm"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25">
                  <Icon size={15} />
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-pink-100 whitespace-nowrap">
                  {it.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
