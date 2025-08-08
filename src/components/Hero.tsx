"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Heart,
  Shield,
  Sparkles,
  Phone,
} from "lucide-react";
import Image from "next/image";

const Hero = () => {
  const featureAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.5 + i * 0.1,
        duration: 0.5,
      },
    }),
  };

  return (
    <section className="relative min-h-[86vh] flex items-center overflow-hidden pt-20">
      {/* Background Gradient & Mesh */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-pink-50 via-white to-pink-50/60 dark:from-pink-900/25 dark:via-purple-900/10 dark:to-pink-900/25" />
      <div className="gradient-mesh" />

      {/* Content */}
      <div className="container mx-auto px-4 z-10">
        <div className="grid lg:grid-cols-2 items-center gap-10 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-effect p-8 md:p-12 rounded-2xl max-w-2xl shadow-xl gradient-ring"
          >
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="section-title text-gradient mb-4"
            >
              Comfort Stay PG
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg md:text-xl mb-6 text-gray-700 dark:text-pink-200/90"
            >
              Premium Girls PG in Hinjewadi • Opened July 2025
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="text-lg mb-6 text-gray-700 dark:text-gray-300"
            >
              Brand new facility now open with comfortable 2-sharing and
              3-sharing rooms.
            </motion.p>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="pill">
                <Shield size={16} /> 24/7 Security
              </span>
              <span className="pill">
                <Sparkles size={16} /> Premium Amenities
              </span>
              <span className="pill">
                <MapPin size={16} /> Prime Location
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center justify-start mb-8 text-gray-600 dark:text-white/80"
            >
              <MapPin size={18} className="mr-2 text-pink-500" />
              <p className="text-sm md:text-base">
                Comfort Stay PG, Hinjewadi Phase 1 Rd, Mukai Nagar, Phase 1,
                Hinjawadi Rajiv Gandhi Infotech Park, Hinjawadi, Pune,
                Pimpri-Chinchwad, Maharashtra 411057
              </p>
            </motion.div>

            <div className="flex flex-wrap gap-3">
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                href="/contact"
                onClick={(e) => {
                  const el = document.getElementById("contact");
                  if (el) {
                    e.preventDefault();
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                    // Update URL hash without page jump
                    history.replaceState(null, "", "#contact");
                  }
                }}
                className="btn-primary inline-flex items-center gap-2"
              >
                Book Your Stay
                <ArrowRight size={18} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                href="https://wa.me/919922538989?text=Hi%20Comfort%20Stay%20PG%2C%20I'm%20interested%20in%20a%20room"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center gap-2"
              >
                WhatsApp Us
                <Phone size={18} />
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-xl lg:justify-self-end"
          >
            <div className="grid grid-cols-2 gap-5">
              <motion.div
                custom={0}
                variants={featureAnimation}
                initial="hidden"
                animate="visible"
                className="card stat-card p-6 shadow-lg hover:shadow-xl flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center mb-4 shadow-inner">
                  <Shield
                    className="text-pink-500 dark:text-pink-300"
                    size={24}
                  />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-2">
                  Enhanced Security
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  24/7 security
                </p>
              </motion.div>

              <motion.div
                custom={1}
                variants={featureAnimation}
                initial="hidden"
                animate="visible"
                className="card stat-card p-6 shadow-lg hover:shadow-xl flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center mb-4 shadow-inner">
                  <Heart
                    className="text-pink-500 dark:text-pink-300"
                    size={24}
                  />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-2">
                  Brand New Building
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Modern facilities opened July 2025
                </p>
              </motion.div>

              <motion.div
                custom={2}
                variants={featureAnimation}
                initial="hidden"
                animate="visible"
                className="card stat-card p-6 shadow-lg hover:shadow-xl flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center mb-4 shadow-inner">
                  <Sparkles
                    className="text-pink-500 dark:text-pink-300"
                    size={24}
                  />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-2">
                  Premium Amenities
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  High-speed WiFi, dining, laundry & more
                </p>
              </motion.div>

              <motion.div
                custom={3}
                variants={featureAnimation}
                initial="hidden"
                animate="visible"
                className="card stat-card p-6 shadow-lg hover:shadow-xl flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center mb-4 shadow-inner">
                  <MapPin
                    className="text-pink-500 dark:text-pink-300"
                    size={24}
                  />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-2">
                  Prime Location
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Walking distance to Hinjewadi IT Park
                </p>
              </motion.div>
            </div>
            <div className="mt-6 hidden md:block overflow-hidden rounded-xl gradient-ring">
              <Image
                src="/gallery/building.jpg"
                alt="Comfort Stay PG Building"
                className="w-full h-56 object-cover"
                width={800}
                height={400}
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-pink-300 dark:border-pink-400 rounded-full flex items-center justify-center">
          <motion.div
            animate={{
              y: [0, 6, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="w-1.5 h-2 bg-pink-300 dark:bg-pink-400 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
