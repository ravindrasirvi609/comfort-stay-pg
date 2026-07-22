"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Home, Quote } from "lucide-react";

interface AuthShellProps {
  side?: "left" | "right";
  compact?: boolean;
  children: React.ReactNode;
}

/**
 * Split-screen auth shell with a brand panel + form column.
 * Brand panel collapses to a compact header on mobile.
 */
export default function AuthShell({
  side = "left",
  compact = false,
  children,
}: AuthShellProps) {
  const brand = (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-white p-8 md:p-12 flex flex-col justify-between min-h-[300px] md:min-h-[600px] lg:min-h-[640px] ${
        compact ? "lg:col-span-4" : "lg:col-span-5"
      }`}
    >
      {/* Ambient */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/25 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-fuchsia-300/40 blur-3xl" />
      <div className="noise opacity-40" />

      <div className="relative">
        <Link
          href="/"
          className="inline-flex items-center gap-2 group"
          aria-label="Comfort Stay PG"
        >
          <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-inner">
            <span className="text-white font-black">CS</span>
          </div>
          <div className="leading-tight">
            <div className="font-bold">Comfort<span className="opacity-90">Stay</span></div>
            <div className="text-xs opacity-80">Girls PG • Hinjewadi</div>
          </div>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="relative"
      >
        <h1 className="font-display text-3xl md:text-5xl font-bold leading-[1.05] mb-4">
          Welcome to your comfort zone.
        </h1>
        <p className="text-white/90 max-w-md">
          A premium, exclusive-for-women PG in Hinjewadi Phase 1 — where safety,
          community, and comfort meet.
        </p>
      </motion.div>

      <div className="relative flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-semibold">
          <ShieldCheck size={12} /> 24/7 Security
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-semibold">
          <Sparkles size={12} /> Opened 2025
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-semibold">
          <Home size={12} /> Homely
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="relative hidden md:block"
      >
        <Quote className="w-6 h-6 opacity-70 mb-2" />
        <p className="italic text-white/90 max-w-md leading-relaxed">
          &ldquo;Moving to Pune was made easy by Comfort Stay. Clean rooms,
          amazing meals, and a truly warm community.&rdquo;
        </p>
        <p className="mt-2 text-xs text-white/70">— Neha, Digital Marketer @ Infosys</p>
      </motion.div>
    </div>
  );

  const content = (
    <div
      className={`relative flex items-center justify-center ${
        compact ? "lg:col-span-8" : "lg:col-span-7"
      }`}
    >
      <div className="w-full max-w-xl">{children}</div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-8rem)] px-2 md:px-0">
      <div className="grid lg:grid-cols-12 gap-6">
        {side === "left" ? brand : content}
        {side === "left" ? content : brand}
      </div>
    </div>
  );
}
