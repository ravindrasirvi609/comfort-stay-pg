"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Users2, BedDouble, Star, Sparkles } from "lucide-react";

interface Stat {
  value: number;
  suffix?: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const stats: Stat[] = [
  { value: 120, suffix: "+", label: "Happy Residents", icon: Users2 },
  { value: 60, suffix: "+", label: "Modern Rooms", icon: BedDouble },
  { value: 15, suffix: "+", label: "Amenities", icon: Sparkles },
  { value: 4.9, label: "Google Rating", icon: Star },
];

function Counter({
  target,
  suffix,
  decimals = 0,
}: {
  target: number;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => {
    return v.toFixed(decimals);
  });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, target, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [inView, mv, target]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

export default function StatsStrip() {
  return (
    <section className="relative py-10">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl border border-pink-100/60 dark:border-pink-900/40 bg-white/70 dark:bg-pink-950/25 backdrop-blur-xl px-6 py-8 md:px-10 md:py-10 shadow-lg shadow-pink-500/5">
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-pink-200/40 blur-3xl pointer-events-none" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
            {stats.map((s, i) => {
              const Icon = s.icon;
              const decimals = s.value % 1 !== 0 ? 1 : 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/30">
                    <Icon size={20} />
                  </div>
                  <div className="text-3xl md:text-4xl font-black font-display text-gray-900 dark:text-white leading-none">
                    <Counter
                      target={s.value}
                      suffix={s.suffix}
                      decimals={decimals}
                    />
                  </div>
                  <div className="mt-2 text-xs md:text-sm text-gray-600 dark:text-pink-100/70 uppercase tracking-widest font-semibold">
                    {s.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
