"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";

const Location = () => {
  return (
    <section id="location" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-effect p-8 md:p-12 rounded-lg"
        >
          <h2 className="comfort-header text-3xl font-bold mb-8 text-center">
            Our Location
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-xl font-bold mb-4 text-pink-600 dark:text-pink-400">
                  Contact Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin
                      className="text-pink-600 dark:text-pink-400"
                      size={20}
                    />
                    <div>
                      <p className="font-semibold">Address</p>
                      <p className="text-gray-600 dark:text-gray-300">
                        Hinjewadi Phase 1 Rd, Mukai Nagar, Phase 1,
                        <br />
                        Hinjawadi Rajiv Gandhi Infotech Park,
                        <br />
                        Hinjawadi, Pune, Pimpri-Chinchwad,
                        <br />
                        Maharashtra 411057
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone
                      className="text-pink-600 dark:text-pink-400"
                      size={20}
                    />
                    <div>
                      <p className="font-semibold">Phone</p>
                      <p className="text-gray-600 dark:text-gray-300">
                        +91 9922 538 989
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail
                      className="text-pink-600 dark:text-pink-400"
                      size={20}
                    />
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-gray-600 dark:text-gray-300">
                        info@comfortstay.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-bold mb-4 text-pink-600 dark:text-pink-400">
                  Nearby Locations
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-pink-500">•</span>
                    <span>Hinjawadi IT Park - 5 min walk</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-pink-500">•</span>
                    <span>Wakad - 10 min drive</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-pink-500">•</span>
                    <span>Baner - 15 min drive</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-pink-500">•</span>
                    <span>Pune Airport - 45 min drive</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Map */}
            <div className="card h-[400px] overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3781.523572720204!2d73.73011351145193!3d18.595506866806665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bb000faf5f0b%3A0x545fd94002c5ec22!2sComfort%20Stay%20PG!5e0!3m2!1sen!2sin!4v1744439824159!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Location;
