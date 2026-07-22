"use client";

import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  MapPin,
  Phone,
  Mail,
  ArrowUp,
  Heart,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const quickLinks = [
  { name: "About Us", href: "/about" },
  { name: "Facilities", href: "/facilities" },
  { name: "Gallery", href: "/gallery" },
  { name: "Testimonials", href: "/testimonials" },
  { name: "FAQs", href: "/faqs" },
  { name: "Contact", href: "/contact" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("/api/subscribers", { email });
      if (response.data.success) {
        toast.success(response.data.message);
        setEmail("");
      } else {
        toast.error(response.data.message || "Failed to subscribe");
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to subscribe. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative mt-20">
      <div className="container mx-auto px-4 sm:px-6 pb-6">
        {/* Floating back-to-top */}
        <div className="flex justify-center -mb-6 relative z-20">
          <motion.button
            onClick={scrollToTop}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.94 }}
            className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/40 flex items-center justify-center"
            aria-label="Back to top"
          >
            <ArrowUp size={18} />
          </motion.button>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-pink-100/60 dark:border-pink-900/40 bg-white/75 dark:bg-[#2b1a26]/60 backdrop-blur-xl shadow-xl pt-16 pb-8 px-6 md:px-10">
          {/* Decorative blob */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-gradient-to-br from-pink-300/40 to-rose-300/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-tr from-rose-200/30 to-pink-200/10 blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Brand */}
            <div className="md:col-span-4">
              <Link href="/" className="inline-flex items-center gap-3 mb-5">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-pink-400 via-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <span className="text-white font-black">CS</span>
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-900 dark:text-white">
                    Comfort<span className="text-pink-500">Stay</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Girls PG • Hinjewadi
                  </div>
                </div>
              </Link>
              <p className="text-sm text-gray-600 dark:text-pink-100/70 leading-relaxed mb-5">
                Premium girls PG accommodation in Hinjewadi, Pune. Comfort,
                security, and modern amenities in a warm community — designed
                for working women and students.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-50 dark:bg-pink-900/30 px-3 py-1 text-[11px] font-semibold text-pink-700 dark:text-pink-200">
                  <ShieldCheck className="w-3 h-3" /> Verified PG
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-50 dark:bg-pink-900/30 px-3 py-1 text-[11px] font-semibold text-pink-700 dark:text-pink-200">
                  <Sparkles className="w-3 h-3" /> Opened 2025
                </span>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <a
                  href="#"
                  className="h-9 w-9 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center hover:bg-pink-100 dark:hover:bg-pink-800/50 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook
                    size={15}
                    className="text-pink-600 dark:text-pink-300"
                  />
                </a>
                <a
                  href="#"
                  className="h-9 w-9 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center hover:bg-pink-100 dark:hover:bg-pink-800/50 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram
                    size={15}
                    className="text-pink-600 dark:text-pink-300"
                  />
                </a>
                <a
                  href="https://wa.me/919922538989"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="h-9 w-9 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center hover:bg-pink-100 dark:hover:bg-pink-800/50 transition-colors"
                  aria-label="WhatsApp"
                >
                  <Phone
                    size={15}
                    className="text-pink-600 dark:text-pink-300"
                  />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-pink-600 dark:text-pink-300 mb-4">
                Explore
              </h3>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-sm text-gray-600 dark:text-pink-100/70 hover:text-pink-600 dark:hover:text-pink-300 transition-colors"
                    >
                      <span className="w-0 group-hover:w-3 h-px bg-pink-500 transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="md:col-span-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-pink-600 dark:text-pink-300 mb-4">
                Reach us
              </h3>
              <ul className="space-y-4 text-sm text-gray-600 dark:text-pink-100/70">
                <li className="flex items-start gap-3">
                  <MapPin
                    size={17}
                    className="text-pink-500 mt-0.5 flex-shrink-0"
                  />
                  <span>
                    Comfort Stay PG, Mukai Nagar,
                    <br />
                    Hinjawadi Rajiv Gandhi Infotech Park,
                    <br />
                    Pune, Maharashtra 411057
                  </span>
                </li>
                <li>
                  <a
                    href="tel:+919922538989"
                    className="flex items-center gap-3 hover:text-pink-600 dark:hover:text-pink-300 transition-colors"
                  >
                    <Phone size={17} className="text-pink-500 flex-shrink-0" />
                    +91 9922 538 989
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@comfortstay.com"
                    className="flex items-center gap-3 hover:text-pink-600 dark:hover:text-pink-300 transition-colors"
                  >
                    <Mail size={17} className="text-pink-500 flex-shrink-0" />
                    info@comfortstay.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="md:col-span-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-pink-600 dark:text-pink-300 mb-4">
                Newsletter
              </h3>
              <p className="text-sm text-gray-600 dark:text-pink-100/70 mb-4">
                Subscribe for updates, offers, and community news.
              </p>
              <form onSubmit={handleSubscribe} className="relative group">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full h-12 rounded-full pl-4 pr-14 bg-white dark:bg-pink-950/30 border border-pink-200/60 dark:border-pink-800/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-sm shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-1.5 top-1.5 h-9 w-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-pink-500/30 hover:shadow-lg hover:shadow-pink-500/50 transition-shadow"
                  aria-label="Subscribe"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="relative mt-10 pt-6 border-t border-pink-100/60 dark:border-pink-900/40 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-pink-100/50">
            <p>
              &copy; {currentYear} Comfort Stay PG. All rights reserved.
            </p>
            <p className="inline-flex items-center gap-1.5">
              Crafted with
              <Heart
                size={12}
                className="text-pink-500 fill-pink-500 animate-pulse"
              />
              in Pune •{" "}
              <a
                href="https://ravindrachoudhary.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-pink-600 hover:text-pink-700 dark:text-pink-300 transition-colors"
              >
                Ravindra Choudhary
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
