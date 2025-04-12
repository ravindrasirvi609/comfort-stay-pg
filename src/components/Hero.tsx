"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin, Heart, Shield, Sparkles } from "lucide-react";

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-pink-50 via-white to-pink-50/50 dark:from-pink-900/30 dark:via-purple-900/20 dark:to-pink-900/30" />

      {/* Decorative elements */}
      <div className="absolute top-[15%] right-[10%] w-72 h-72 bg-gradient-to-br from-pink-100/30 to-pink-50/10 rounded-full blur-3xl dark:from-pink-800/10 dark:to-purple-800/5"></div>
      <div className="absolute bottom-[15%] left-[10%] w-80 h-80 bg-gradient-to-tr from-pink-100/30 to-pink-50/10 rounded-full blur-3xl dark:from-pink-800/10 dark:to-purple-800/5"></div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-effect p-8 md:p-12 rounded-2xl max-w-2xl shadow-xl"
          >
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="comfort-header text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-800 dark:text-white"
            >
              Welcome to{" "}
              <span className="text-pink-500 dark:text-pink-300">
                Comfort Stay
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="comfort-subheading text-xl md:text-2xl mb-6 text-gray-600 dark:text-pink-200/90"
            >
              New Girls PG in Hinjewadi • Opened March 2025
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="text-lg mb-6 text-gray-700 dark:text-gray-300"
            >
              Pre-bookings open for our brand new facility with comfortable
              2-sharing and 3-sharing rooms.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center justify-start mb-8 text-gray-600 dark:text-white/80"
            >
              <MapPin size={18} className="mr-2 text-pink-500" />
              <p className="text-sm md:text-base">
                Hinjewadi Phase 1 Rd, Mukai Nagar, Rajiv Gandhi Infotech Park,
                Pune, Maharashtra 411057
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <a
                href="#contact"
                className="btn-primary inline-flex items-center gap-2"
              >
                Book Your Stay
                <ArrowRight size={18} />
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <motion.div
                custom={0}
                variants={featureAnimation}
                initial="hidden"
                animate="visible"
                className="card p-6 bg-white/90 dark:bg-pink-900/20 shadow-lg hover:shadow-xl flex flex-col items-center text-center"
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
                  24/7 security with biometric access
                </p>
              </motion.div>

              <motion.div
                custom={1}
                variants={featureAnimation}
                initial="hidden"
                animate="visible"
                className="card p-6 bg-white/90 dark:bg-pink-900/20 shadow-lg hover:shadow-xl flex flex-col items-center text-center"
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
                  Modern facilities Opened March 2025
                </p>
              </motion.div>

              <motion.div
                custom={2}
                variants={featureAnimation}
                initial="hidden"
                animate="visible"
                className="card p-6 bg-white/90 dark:bg-pink-900/20 shadow-lg hover:shadow-xl flex flex-col items-center text-center"
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
                className="card p-6 bg-white/90 dark:bg-pink-900/20 shadow-lg hover:shadow-xl flex flex-col items-center text-center"
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
