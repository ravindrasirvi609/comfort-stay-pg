"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Facebook,
  Twitter,
  Instagram,
  MapPin,
  Phone,
  Mail,
  ArrowUp,
  Heart,
  Loader2,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
    <footer className="bg-gradient-to-b from-transparent to-pink-50/50 dark:from-transparent dark:to-pink-950/20 pt-16 sm:pt-20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Back to top button */}
        <div className="flex justify-center -mt-10 sm:-mt-12 mb-8 sm:mb-10">
          <button
            onClick={scrollToTop}
            className="bg-white dark:bg-pink-900/60 w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg flex items-center justify-center transform hover:translate-y-[-5px] transition-all duration-300 group"
            aria-label="Back to top"
          >
            <ArrowUp
              size={18}
              className="text-pink-500 dark:text-pink-300 group-hover:scale-110 transition-transform duration-300"
            />
          </button>
        </div>

        <div className="glass-effect rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-10 mb-5 sm:mb-6 shadow-soft">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About Section */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-pink-500 dark:text-pink-300">
                Comfort Stay
              </h3>
              <p className="text-gray-600 dark:text-pink-100/70 mb-4 text-sm leading-relaxed">
                Premium girls PG accommodation in Hinjewadi, Pune. Experience
                comfort, security, and modern amenities in a safe and welcoming
                environment.
              </p>
              <div className="flex items-center space-x-3 sm:space-x-4 mt-4">
                <a
                  href="#"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center hover:bg-pink-100 dark:hover:bg-pink-800/50 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook
                    size={16}
                    className="text-pink-500 dark:text-pink-300"
                  />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center hover:bg-pink-100 dark:hover:bg-pink-800/50 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter
                    size={16}
                    className="text-pink-500 dark:text-pink-300"
                  />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center hover:bg-pink-100 dark:hover:bg-pink-800/50 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram
                    size={16}
                    className="text-pink-500 dark:text-pink-300"
                  />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-pink-500 dark:text-pink-300">
                Quick Links
              </h3>
              <ul className="space-y-2">
                {[
                  { name: "Home", href: "/" },
                  { name: "About", href: "#about" },
                  { name: "Amenities", href: "#amenities" },
                  { name: "Rooms", href: "#rooms" },
                  { name: "Gallery", href: "#gallery" },
                  { name: "Location", href: "#location" },
                  { name: "Contact", href: "#contact" },
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 dark:text-pink-100/70 hover:text-pink-500 dark:hover:text-pink-300 transition-colors flex items-center text-sm"
                    >
                      <span className="mr-2 text-pink-400">›</span> {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-pink-500 dark:text-pink-300">
                Contact Info
              </h3>
              <ul className="space-y-3 sm:space-y-4 text-gray-600 dark:text-pink-100/70">
                <li className="flex items-start gap-3">
                  <MapPin
                    size={18}
                    className="text-pink-400 mt-1 flex-shrink-0"
                  />
                  <span className="text-sm">
                    Comfort Stay PG, Mukai Nagar,
                    <br />
                    Hinjawadi Rajiv Gandhi Infotech Park,
                    <br />
                    Pune, Pimpri-Chinchwad,
                    <br />
                    Maharashtra 411057
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-pink-400 flex-shrink-0" />
                  <span className="text-sm">+91 9922 538 989</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-pink-400 flex-shrink-0" />
                  <span className="text-sm">info@comfortstay.com</span>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-pink-500 dark:text-pink-300">
                Subscribe
              </h3>
              <p className="text-gray-600 dark:text-pink-100/70 mb-3 sm:mb-4 text-sm">
                Subscribe to our newsletter for updates and special offers.
              </p>
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row"
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  className="rounded-lg sm:rounded-r-none py-2 px-3 bg-white dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800/50 focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-500 w-full text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="submit"
                  className="btn-primary mt-2 sm:mt-0 sm:rounded-l-none text-sm py-2 px-4 flex items-center justify-center min-w-[100px]"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="py-5 sm:py-6 text-center text-gray-500 dark:text-pink-100/40 text-xs">
          <p>
            &copy; {currentYear} Comfort Stay PG. All rights reserved. Made with{" "}
            <Heart
              size={12}
              className="inline-block text-pink-500 fill-pink-500 mb-0.5"
            />{" "}
            in Pune
          </p>
          <p className="mt-2">
            Developed and maintained by{" "}
            <a
              href="https://ravindrachoudhary.in"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-pink-500 dark:hover:text-pink-300 transition-colors"
            >
              Ravindra Choudhary
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
