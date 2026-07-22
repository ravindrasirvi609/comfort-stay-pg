"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import {
  ArrowRight,
  MapPin,
  Shield,
  Sparkles,
  Phone,
  Star,
  CheckCircle2,
} from "lucide-react";
import BlurText from "../BlurText";
import MagneticButton from "../MagneticButton";

const trustBadges = [
  { icon: Shield, label: "24/7 Security" },
  { icon: Sparkles, label: "Brand New Building" },
  { icon: MapPin, label: "Near IT Park" },
];

export default function HeroV2() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yImage = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const yBadge = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  return (
    <section
      ref={ref}
      className="relative min-h-[92vh] flex items-center overflow-hidden pt-6 md:pt-10"
    >
      {/* Ambient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-pink-50 via-white to-pink-50/40 dark:from-pink-950/40 dark:via-transparent dark:to-pink-950/40 rounded-[2.5rem]" />
      <div className="gradient-mesh" />
      <div className="noise rounded-[2.5rem]" />

      <div className="container mx-auto px-2 md:px-6 relative">
        <div className="grid lg:grid-cols-12 items-center gap-10 lg:gap-8">
          {/* Left column — copy */}
          <div className="lg:col-span-7 relative">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="eyebrow mb-4"
            >
              <span className="w-8 h-px bg-pink-500" />
              Comfort Stay PG • Opened July 2025
            </motion.div>

            <BlurText
              as="h1"
              text="Live comfortably. Grow confidently."
              className="font-display text-[clamp(2.5rem,5vw,4.75rem)] font-bold leading-[1.02] tracking-tight text-gray-900 dark:text-white mb-4"
            />

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="max-w-xl text-lg text-gray-600 dark:text-pink-100/80 mb-6"
            >
              A premium, exclusively-for-women PG in the heart of Hinjewadi
              Phase 1 — brand new twin & triple-sharing rooms, thoughtful
              amenities, and a community that feels like home.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {trustBadges.map((b, i) => {
                const Icon = b.icon;
                return (
                  <span key={i} className="pill">
                    <Icon size={14} />
                    {b.label}
                  </span>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex flex-wrap items-center gap-3 mb-10"
            >
              <MagneticButton
                href="/contact"
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/50 transition-shadow"
              >
                Book Your Stay
                <ArrowRight size={17} />
              </MagneticButton>
              <MagneticButton
                href="https://wa.me/919922538989?text=Hi%20Comfort%20Stay%20PG%2C%20I'm%20interested%20in%20a%20room"
                target="_blank"
                rel="noopener noreferrer"
                strength={16}
                className="border border-pink-200/70 dark:border-pink-800/60 bg-white/70 dark:bg-pink-950/30 backdrop-blur text-pink-700 dark:text-pink-200 hover:bg-pink-50 dark:hover:bg-pink-900/40 transition-colors"
              >
                <Phone size={16} />
                WhatsApp
              </MagneticButton>
            </motion.div>

            {/* Social proof strip */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex items-center gap-4"
            >
              <div className="flex -space-x-2">
                {[
                  "from-pink-400 to-rose-500",
                  "from-fuchsia-400 to-pink-500",
                  "from-rose-400 to-red-400",
                  "from-pink-300 to-fuchsia-400",
                ].map((g, i) => (
                  <div
                    key={i}
                    className={`h-9 w-9 rounded-full bg-gradient-to-br ${g} ring-2 ring-white dark:ring-[#2b1a26]`}
                  />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-pink-600 dark:text-pink-300">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className="fill-pink-500 stroke-pink-500" />
                  ))}
                  <span className="ml-1 font-bold text-gray-900 dark:text-white">
                    4.9
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-pink-100/60">
                  Loved by residents
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right column — visual */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto">
              {/* Main image card */}
              <motion.div
                style={{ y: yImage }}
                className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl shadow-pink-500/20 gradient-ring"
              >
                <Image
                  src="/gallery/building.jpg"
                  alt="Comfort Stay PG Building"
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 1024px) 30vw, 80vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-white">
                  <div>
                    <div className="text-xs opacity-80">Now open</div>
                    <div className="font-bold text-lg">Hinjewadi Phase 1</div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/25 backdrop-blur px-3 py-1 text-xs font-semibold">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                </div>
              </motion.div>

              {/* Floating badge — price */}
              <motion.div
                style={{ y: yBadge }}
                initial={{ opacity: 0, scale: 0.9, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="absolute -left-4 md:-left-10 top-8 rounded-2xl bg-white/90 dark:bg-[#2b1a26]/85 backdrop-blur-xl border border-pink-100 dark:border-pink-900/60 shadow-xl p-4 min-w-[168px]"
              >
                <div className="text-[10px] uppercase tracking-widest text-pink-500 font-bold">
                  Starting from
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">
                  ₹8,500
                  <span className="text-xs font-medium text-gray-500 dark:text-pink-100/60">
                    /month
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-pink-100/60 mt-0.5">
                  All-inclusive
                </div>
              </motion.div>

              {/* Floating badge — amenities */}
              <motion.div
                style={{ y: yBadge }}
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.75, duration: 0.6 }}
                className="absolute -right-4 md:-right-10 bottom-14 rounded-2xl bg-white/90 dark:bg-[#2b1a26]/85 backdrop-blur-xl border border-pink-100 dark:border-pink-900/60 shadow-xl p-4"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-pink-600 dark:text-pink-300 mb-2">
                  <Sparkles size={12} /> Included
                </div>
                <div className="space-y-1 text-xs text-gray-700 dark:text-pink-100/80">
                  <div>✓ WiFi • Meals</div>
                  <div>✓ Housekeeping</div>
                  <div>✓ CCTV Security</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 flex-col items-center gap-1 text-pink-500"
        >
          <div className="h-8 w-5 rounded-full border-2 border-pink-300 dark:border-pink-500 flex justify-center pt-1.5">
            <span className="h-1.5 w-1 rounded-full bg-pink-400" />
          </div>
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        </motion.div>
      </div>
    </section>
  );
}
