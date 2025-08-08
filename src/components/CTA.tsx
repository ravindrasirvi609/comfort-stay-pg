"use client";

import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl p-6 md:p-10 bg-gradient-to-br from-pink-100 via-rose-50 to-white dark:from-pink-900/30 dark:via-rose-900/10 dark:to-transparent gradient-ring">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-pink-200/50 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-52 h-52 rounded-full bg-rose-200/50 blur-3xl" />
          <div className="relative z-10 grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                Ready to book your perfect stay?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Limited rooms available in our brand new facility. Contact us
                today and secure your spot.
              </p>
            </div>
            <div className="flex gap-3 md:justify-end">
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="#contact"
                className="btn-primary inline-flex items-center gap-2"
              >
                Enquire Now <ArrowRight size={18} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="https://wa.me/919922538989?text=Hi%20Comfort%20Stay%20PG%2C%20I%27d%20like%20to%20book%20a%20room"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center gap-2"
              >
                WhatsApp <Phone size={18} />
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
