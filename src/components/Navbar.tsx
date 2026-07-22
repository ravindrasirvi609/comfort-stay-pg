"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../hooks/useAuth";
import {
  MenuIcon,
  Home,
  Building,
  GalleryHorizontal,
  MessageSquareText,
  HelpCircle,
  Contact,
  Sparkles,
  LogIn,
  UserPlus,
  LogOut,
  User,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/about", label: "About", icon: Building },
  { href: "/facilities", label: "Facilities", icon: Sparkles },
  { href: "/gallery", label: "Gallery", icon: GalleryHorizontal },
  { href: "/testimonials", label: "Testimonials", icon: MessageSquareText },
  { href: "/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/contact", label: "Contact", icon: Contact },
];

const isValidImageSrc = (src?: string): boolean => {
  try {
    if (!src || typeof src !== "string") return false;
    if (src.startsWith("/")) return true;
    const u = new URL(src);
    return ["http:", "https:", "data:"].includes(u.protocol);
  } catch {
    return false;
  }
};

export default function Navbar() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/75 dark:bg-[#2b1a26]/75 backdrop-blur-xl border-b border-pink-100/60 dark:border-pink-900/40 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 md:h-18 items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center group">
            <motion.div
              whileHover={{ rotate: 6, scale: 1.06 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-pink-400 via-pink-500 to-rose-500 flex items-center justify-center mr-3 shadow-lg shadow-pink-500/30"
            >
              <span className="text-white font-black text-base tracking-tight">
                CS
              </span>
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/50 to-transparent opacity-60" />
            </motion.div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                Comfort<span className="text-pink-500">Stay</span>
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 -mt-0.5">
                Girls PG • Hinjewadi
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            onMouseLeave={() => setHovered(null)}
            className="hidden lg:flex items-center gap-1 rounded-full border border-pink-100/70 dark:border-pink-900/40 bg-white/40 dark:bg-pink-950/20 backdrop-blur-md px-2 py-1.5 shadow-sm"
          >
            {navLinks.map((link) => {
              const active = pathname === link.href;
              const isHover = hovered === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHovered(link.href)}
                  className={cn(
                    "relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors",
                    active
                      ? "text-white"
                      : "text-gray-700 dark:text-gray-200 hover:text-pink-600 dark:hover:text-pink-300"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 shadow-md shadow-pink-500/25"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  {!active && isHover && (
                    <motion.span
                      layoutId="nav-hover"
                      className="absolute inset-0 rounded-full bg-pink-100/70 dark:bg-pink-900/40"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Auth / CTA (desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  href={
                    user?.role === "admin"
                      ? "/admin"
                      : user?.role === "manager"
                        ? "/manager"
                        : "/dashboard"
                  }
                  className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium bg-pink-50/70 dark:bg-pink-900/25 hover:bg-pink-100 dark:hover:bg-pink-800/40 transition-colors"
                >
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-800/30 flex items-center justify-center overflow-hidden border-2 border-pink-200 dark:border-pink-700">
                      {user?.profileImage &&
                      isValidImageSrc(user.profileImage) ? (
                        <Image
                          src={user.profileImage}
                          alt={user.name}
                          className="h-full w-full object-cover"
                          width={32}
                          height={32}
                        />
                      ) : (
                        <User className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#2b1a26]" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-200">
                    {user?.name?.split(" ")[0] || "User"}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/30 transition-colors"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-pink-600 dark:hover:text-pink-300 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="btn-primary text-sm py-2 px-5"
                >
                  Join us
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile trigger */}
          <div className="flex lg:hidden">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <button
                  className="inline-flex items-center justify-center p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors"
                  aria-label="Open menu"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-96 px-0">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-md">
                      <span className="text-white font-black text-sm">CS</span>
                    </div>
                    ComfortStay
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-1 px-4 pt-4 pb-6">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const active = pathname === link.href;
                    return (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors",
                            active
                              ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25"
                              : "text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-pink-900/30"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          {link.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                  <div className="h-px my-3 bg-gradient-to-r from-transparent via-pink-200 to-transparent dark:via-pink-800" />
                  {isAuthenticated ? (
                    <div className="grid grid-cols-3 gap-2">
                      <SheetClose asChild>
                        <Link
                          href={
                            user?.role === "admin"
                              ? "/admin"
                              : user?.role === "manager"
                                ? "/manager"
                                : "/dashboard"
                          }
                          className="col-span-2 flex items-center gap-2 px-4 py-3 rounded-2xl bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-200 font-semibold text-sm"
                        >
                          <User className="w-4 h-4" />
                          {user?.name?.split(" ")[0] || "Dashboard"}
                        </Link>
                      </SheetClose>
                      <button
                        onClick={(e) => {
                          handleLogout(e);
                          setSheetOpen(false);
                        }}
                        className="flex items-center justify-center rounded-2xl border border-pink-200 dark:border-pink-800/50"
                      >
                        <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <SheetClose asChild>
                        <Link
                          href="/login"
                          className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-pink-200 dark:border-pink-800/60 text-gray-700 dark:text-gray-200 font-semibold text-sm"
                        >
                          <LogIn className="w-4 h-4" />
                          Sign in
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/register"
                          className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm shadow-md shadow-pink-500/25"
                        >
                          <UserPlus className="w-4 h-4" />
                          Join
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
