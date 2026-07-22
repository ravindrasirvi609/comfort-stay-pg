"use client";

import { motion } from "framer-motion";
import { Home, Users, Shield, Heart, Flower, Clock } from "lucide-react";
import BlurText from "../BlurText";

const features = [
  {
    icon: Home,
    title: "Comfortable Living",
    description: "Stylish, spacious rooms crafted for women's comfort & privacy.",
  },
  {
    icon: Shield,
    title: "Enhanced Security",
    description: "24/7 CCTV surveillance and dedicated security personnel.",
  },
  {
    icon: Users,
    title: "Women's Community",
    description: "A safe, supportive space for working women & students.",
  },
  {
    icon: Clock,
    title: "Flexible Timings",
    description: "No strict curfews — secure access system for residents.",
  },
  {
    icon: Flower,
    title: "Clean Environment",
    description: "Daily housekeeping and well-maintained common areas.",
  },
  {
    icon: Heart,
    title: "Homely Atmosphere",
    description: "Caring staff and amenities that feel like home.",
  },
];

export default function AboutV2() {
  return (
    <section id="about" className="relative py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left — editorial copy */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="eyebrow mb-4"
            >
              <span className="w-8 h-px bg-pink-500" /> About Comfort Stay
            </motion.div>
            <BlurText
              as="h2"
              text="Where comfort meets community."
              className="font-display text-[clamp(2rem,3.5vw,3.5rem)] font-bold leading-[1.06] tracking-tight text-gray-900 dark:text-white mb-6"
            />
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-lg text-gray-600 dark:text-pink-100/75 mb-5 leading-relaxed"
            >
              Welcome to{" "}
              <span className="font-semibold text-pink-600 dark:text-pink-300">
                Comfort Stay PG
              </span>{" "}
              — an exclusive girls&apos; PG in Hinjewadi Phase 1, Pune, that
              opened in July 2025. Modern comfort, warm hospitality, and a
              location built for the way you work and study.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-base text-gray-600 dark:text-pink-100/70 leading-relaxed"
            >
              Walking distance to Hinjewadi IT Park and major campuses, with
              thoughtful 2 & 3-sharing rooms, curated amenities, and a
              community that celebrates every ambition.
            </motion.p>
          </div>

          {/* Right — feature grid */}
          <div className="lg:col-span-7">
            <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{ y: -4 }}
                    className="group relative rounded-3xl border border-pink-100/60 dark:border-pink-900/40 bg-white/70 dark:bg-pink-950/25 backdrop-blur-xl p-5 md:p-6 shadow-sm hover:shadow-lg hover:shadow-pink-500/10 transition-all"
                  >
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">
                      {f.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-pink-100/70 leading-relaxed">
                      {f.description}
                    </p>
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-500/0 to-rose-500/0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
