"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ModeToggle from "./ModeToggle";
import {
  MenuIcon,
  XIcon,
  Home,
  Building,
  GalleryHorizontal,
  MessageSquareText,
  HelpCircle,
  Contact,
  Sparkles,
  LogIn,
  PhoneCall,
  UserPlus,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
  { href: "/about", label: "About", icon: <Building className="w-4 h-4" /> },
  {
    href: "/facilities",
    label: "Facilities",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    href: "/gallery",
    label: "Gallery",
    icon: <GalleryHorizontal className="w-4 h-4" />,
  },
  {
    href: "/testimonials",
    label: "Testimonials",
    icon: <MessageSquareText className="w-4 h-4" />,
  },
  { href: "/faqs", label: "FAQs", icon: <HelpCircle className="w-4 h-4" /> },
  { href: "/contact", label: "Contact", icon: <Contact className="w-4 h-4" /> },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="bg-gradient-to-r from-pink-400 to-pink-600 h-10 w-10 rounded-full flex items-center justify-center mr-2 shadow-sm">
                <span className="text-white font-bold text-lg">CS</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-gray-900 dark:text-white">
                  Comfort<span className="text-pink-500">Stay</span>
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 -mt-1">
                  Girls PG • Hinjewadi
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  pathname === link.href
                    ? "text-pink-600 dark:text-pink-400 font-semibold bg-pink-50/50 dark:bg-pink-900/20"
                    : "text-gray-700 hover:text-pink-600 dark:text-gray-200 dark:hover:text-pink-400 hover:bg-pink-50/50 dark:hover:bg-pink-900/10"
                }`}
              >
                <span className="opacity-70">{link.icon}</span>
                {link.label}
              </Link>
            ))}

            {/* Login and Registration Buttons */}
            <div className="ml-2 flex space-x-1">
              <Link
                href="/login"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  pathname === "/login"
                    ? "text-pink-600 dark:text-pink-400 font-semibold bg-pink-50/50 dark:bg-pink-900/20"
                    : "text-gray-700 hover:text-pink-600 dark:text-gray-200 dark:hover:text-pink-400 hover:bg-pink-50/50 dark:hover:bg-pink-900/10"
                }`}
              >
                <LogIn className="w-4 h-4 opacity-70" />
                Login
              </Link>
              <Link
                href="/register"
                className="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </Link>
              <Link
                href="/contact"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  pathname === "/contact"
                    ? "text-pink-600 dark:text-pink-400 font-semibold bg-pink-50/50 dark:bg-pink-900/20"
                    : "text-gray-700 hover:text-pink-600 dark:text-gray-200 dark:hover:text-pink-400 hover:bg-pink-50/50 dark:hover:bg-pink-900/10"
                }`}
              >
                <PhoneCall className="w-4 h-4 opacity-70" />
                Contact
              </Link>
            </div>

            <ModeToggle />
          </nav>

          {/* Mobile Navigation Button */}
          <div className="flex md:hidden items-center gap-2">
            <ModeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-pink-100 dark:hover:bg-pink-900/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <XIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t dark:border-gray-800 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center gap-2 ${
                  pathname === link.href
                    ? "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20"
                    : "text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:text-pink-600 dark:hover:text-pink-400"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="opacity-70">{link.icon}</span>
                {link.label}
              </Link>
            ))}

            {/* Login and Registration in Mobile Menu */}
            <div className="border-t dark:border-gray-800 pt-2 mt-2 grid grid-cols-3 gap-2">
              <Link
                href="/login"
                className={`px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center justify-center gap-2 ${
                  pathname === "/login"
                    ? "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20"
                    : "text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:text-pink-600 dark:hover:text-pink-400 border border-gray-200 dark:border-gray-700"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn className="w-4 h-4 opacity-70" />
                Login
              </Link>
              <Link
                href="/register"
                className="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md text-base font-medium transition-colors flex items-center justify-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <UserPlus className="w-4 h-4" />
                Register
              </Link>
              <Link
                href="/contact"
                className={`px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center justify-center gap-2 ${
                  pathname === "/contact"
                    ? "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20"
                    : "text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:text-pink-600 dark:hover:text-pink-400 border border-gray-200 dark:border-gray-700"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <PhoneCall className="w-4 h-4 opacity-70" />
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
