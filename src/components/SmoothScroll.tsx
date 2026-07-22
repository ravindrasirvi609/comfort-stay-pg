"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Boots Lenis smooth-scroll on mount.
 * Respects prefers-reduced-motion and disables itself on route paths
 * where a scroll container would fight with the page shell (admin/dashboard).
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect reduced-motion preference
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return;

    // Skip smooth-scroll inside admin/dashboard shells (they scroll internally)
    const path = window.location.pathname;
    if (
      path.startsWith("/admin") ||
      path.startsWith("/manager") ||
      path.startsWith("/dashboard")
    ) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
