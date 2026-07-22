"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Navigation, Clock } from "lucide-react";
import BlurText from "../BlurText";

const landmarks = [
  { name: "Hinjewadi IT Park", eta: "5 min walk" },
  { name: "Wakad", eta: "10 min drive" },
  { name: "Baner", eta: "15 min drive" },
  { name: "Pune Airport", eta: "45 min drive" },
  { name: "Symbiosis Institute", eta: "12 min drive" },
];

export default function LocationV2() {
  return (
    <section id="location" className="py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="eyebrow mb-4 justify-center">
            <span className="w-8 h-px bg-pink-500" /> Location
            <span className="w-8 h-px bg-pink-500" />
          </div>
          <BlurText
            as="h2"
            text="Perfectly placed for work & life."
            className="font-display text-[clamp(2rem,3.5vw,3.25rem)] font-bold leading-[1.08] tracking-tight text-gray-900 dark:text-white mb-4"
          />
          <p className="text-gray-600 dark:text-pink-100/70">
            Right at the doorstep of Hinjawadi Phase 1 — 5 minutes to IT Park.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left — contact card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex flex-col gap-5"
          >
            <div className="rounded-3xl border border-pink-100/60 dark:border-pink-900/40 bg-white/70 dark:bg-pink-950/25 backdrop-blur-xl p-6 md:p-7 shadow-sm">
              <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md">
                  <MapPin size={18} />
                </span>
                Reach us
              </h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-pink-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Address
                    </p>
                    <p className="text-gray-600 dark:text-pink-100/70">
                      Hinjewadi Phase 1 Rd, Mukai Nagar, Rajiv Gandhi Infotech
                      Park, Pune 411057
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone size={16} className="text-pink-500 mt-0.5 shrink-0" />
                  <a
                    href="tel:+919922538989"
                    className="text-gray-800 dark:text-pink-100 hover:text-pink-600 dark:hover:text-pink-300 transition-colors font-medium"
                  >
                    +91 9922 538 989
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={16} className="text-pink-500 mt-0.5 shrink-0" />
                  <a
                    href="mailto:info@comfortstay.com"
                    className="text-gray-800 dark:text-pink-100 hover:text-pink-600 dark:hover:text-pink-300 transition-colors font-medium"
                  >
                    info@comfortstay.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock size={16} className="text-pink-500 mt-0.5 shrink-0" />
                  <p className="text-gray-600 dark:text-pink-100/70">
                    Visits: 10 AM – 8 PM • Open 7 days
                  </p>
                </li>
              </ul>
              <a
                href="https://maps.google.com/?q=Comfort+Stay+PG+Hinjawadi"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 btn-primary w-full justify-center"
              >
                <Navigation size={16} /> Open in Google Maps
              </a>
            </div>

            <div className="rounded-3xl border border-pink-100/60 dark:border-pink-900/40 bg-white/70 dark:bg-pink-950/25 backdrop-blur-xl p-6 md:p-7 shadow-sm">
              <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-4">
                Nearby landmarks
              </h3>
              <div className="flex flex-wrap gap-2">
                {landmarks.map((l) => (
                  <span
                    key={l.name}
                    className="inline-flex items-center gap-2 rounded-full border border-pink-200/70 dark:border-pink-800/50 bg-pink-50/60 dark:bg-pink-900/20 px-3 py-1.5 text-xs font-medium text-gray-800 dark:text-pink-100"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                    {l.name}
                    <span className="text-pink-600 dark:text-pink-300 font-semibold">
                      · {l.eta}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right — map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7 rounded-3xl overflow-hidden border border-pink-100/60 dark:border-pink-900/40 shadow-lg shadow-pink-500/10 relative min-h-[420px] lg:min-h-[560px]"
          >
            <iframe
              title="Comfort Stay PG location on Google Maps"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3781.523572720204!2d73.73011351145193!3d18.595506866806665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bb000faf5f0b%3A0x545fd94002c5ec22!2sComfort%20Stay%20PG!5e0!3m2!1sen!2sin!4v1744439824159!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, position: "absolute", inset: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
