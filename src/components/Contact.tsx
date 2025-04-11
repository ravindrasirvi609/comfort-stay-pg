"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-effect p-8 md:p-12 rounded-lg"
        >
          <h2 className="comfort-header text-3xl font-bold mb-8 text-center">
            Contact Us
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-xl font-bold mb-4 text-pink-600 dark:text-pink-400">
                  Get in Touch
                </h3>
                <div className="space-y-4">
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
                        Mukai Nagar, Phase 1, Hinjawadi,
                        <br />
                        Rajiv Gandhi Infotech Park, Pune,
                        <br />
                        Maharashtra 411057
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-bold mb-4 text-pink-600 dark:text-pink-400">
                  Visiting Hours
                </h3>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span>Monday - Saturday</span>
                    <span>9:00 AM - 8:00 PM</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Sunday</span>
                    <span>10:00 AM - 6:00 PM</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                    * For PG residents: 24/7 access with secure entry
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-4 text-pink-600 dark:text-pink-400">
                Enquire Now
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Your email address"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Your phone number"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="input-field"
                    placeholder="Your message or inquiry"
                    required
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-700 transition-colors text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                >
                  Send Message
                  <Send size={18} />
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
