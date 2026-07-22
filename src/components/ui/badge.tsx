import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow",
        soft: "border-pink-200/60 bg-pink-50 text-pink-700 dark:border-pink-800/60 dark:bg-pink-900/30 dark:text-pink-200",
        outline:
          "border-pink-300 text-pink-700 dark:border-pink-700 dark:text-pink-200",
        success:
          "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
      },
    },
    defaultVariants: {
      variant: "soft",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
