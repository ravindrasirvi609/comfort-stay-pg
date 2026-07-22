"use client";

import { motion } from "framer-motion";
import { ArrowRight, Phone, Sparkles } from "lucide-react";
import MagneticButton from "../MagneticButton";

export default function CTASection() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2rem] p-8 md:p-14 lg:p-16 bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-white shadow-2xl shadow-pink-500/40"
        >
          {/* Decorative blobs */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-rose-300/30 blur-3xl" />
          <div className="noise opacity-40" />

          <div className="relative grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles size={12} /> Limited rooms available
              </div>
              <h3 className="font-display text-3xl md:text-5xl font-bold leading-[1.05] mb-3">
                Ready to book your perfect stay?
              </h3>
              <p className="text-white/90 text-base md:text-lg max-w-xl">
                Move in this month into our brand-new July 2025 building.
                Comfort, security, and community — all included.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <MagneticButton
                href="/contact"
                className="bg-white text-pink-600 shadow-lg hover:shadow-xl transition-shadow"
              >
                Enquire Now <ArrowRight size={17} />
              </MagneticButton>
              <MagneticButton
                href="https://wa.me/919922538989?text=Hi%20Comfort%20Stay%20PG%2C%20I%27d%20like%20to%20book%20a%20room"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/40 bg-white/10 backdrop-blur text-white hover:bg-white/20 transition-colors"
              >
                <Phone size={16} /> WhatsApp
              </MagneticButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
