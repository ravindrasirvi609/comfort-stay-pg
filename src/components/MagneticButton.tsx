"use client";

import { useRef, useState } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type MagneticButtonProps = Omit<HTMLMotionProps<"a">, "href" | "ref"> & {
  href: string;
  children: React.ReactNode;
  className?: string;
  strength?: number;
};

/**
 * Cursor-following CTA. Falls back gracefully on touch (no magnetism there).
 */
export default function MagneticButton({
  href,
  children,
  className,
  strength = 22,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * strength;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * strength;
    setPos({ x, y });
  };

  const handleLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.3 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold",
        className
      )}
      {...rest}
    >
      {children}
    </motion.a>
  );
}
