"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";
import BlurText from "./BlurText";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
}

export default function PageHero({
  eyebrow,
  title,
  description,
  breadcrumb = [],
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-pink-100/50 dark:border-pink-900/40 bg-gradient-to-br from-white/80 via-pink-50/40 to-white/80 dark:from-pink-950/30 dark:via-pink-900/10 dark:to-pink-950/30 backdrop-blur-xl mb-14 mt-4">
      <div className="gradient-mesh" />
      <div className="relative z-10 px-6 py-14 md:px-14 md:py-20 text-center">
        {/* Breadcrumb */}
        <nav
          aria-label="breadcrumb"
          className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-pink-200/60 mb-5"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-pink-600 dark:hover:text-pink-300 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
          {breadcrumb.map((b, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 opacity-60" />
              {b.href ? (
                <Link
                  href={b.href}
                  className="hover:text-pink-600 dark:hover:text-pink-300 transition-colors"
                >
                  {b.label}
                </Link>
              ) : (
                <span className="text-pink-600 dark:text-pink-300 font-semibold">
                  {b.label}
                </span>
              )}
            </span>
          ))}
        </nav>

        {eyebrow && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow mb-4 justify-center"
          >
            <span className="inline-block w-6 h-px bg-pink-400" />
            {eyebrow}
            <span className="inline-block w-6 h-px bg-pink-400" />
          </motion.div>
        )}

        <BlurText
          text={title}
          as="h1"
          className="section-title text-gradient title-accent mb-6"
        />

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto text-base md:text-lg text-gray-600 dark:text-pink-100/70"
          >
            {description}
          </motion.p>
        )}
      </div>
    </section>
  );
}
