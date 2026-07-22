"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BlurTextProps {
  text: string;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  delay?: number;
  stagger?: number;
  once?: boolean;
}

/**
 * Word-by-word blur-in reveal. Renders as any heading/paragraph tag.
 */
export default function BlurText({
  text,
  className,
  as: Tag = "h2",
  delay = 0,
  stagger = 0.08,
  once = true,
}: BlurTextProps) {
  const words = text.split(" ");

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };
  const word = {
    hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  const MotionTag = motion(Tag as any);

  return (
    <MotionTag
      className={cn(className)}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.4 }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          variants={word}
          className="inline-block mr-[0.28em] last:mr-0"
        >
          {w}
        </motion.span>
      ))}
    </MotionTag>
  );
}
