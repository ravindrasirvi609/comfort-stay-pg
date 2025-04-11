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
                        Comfort Stay PG, Hinjewadi Phase 1 Rd,
                        <br />
                        Mukai Nagar, Phase 1, Hinjawadi
                        <br />
                        Rajiv Gandhi Infotech Park, Pune,
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
                        +91 98765 43210
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3781.802900628579!2d73.7317519749631!3d18.58962648378436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9eee54886e3%3A0x828cd1e3c2649a57!2sPhase%201%2C%20Hinjawadi%20Rajiv%20Gandhi%20Infotech%20Park%2C%20Hinjawadi%2C%20Pimpri-Chinchwad%2C%20Maharashtra%20411057!5e0!3m2!1sen!2sin!4v1716290265018!5m2!1sen!2sin"
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
