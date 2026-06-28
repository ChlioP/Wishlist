import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/classes";

type BadgeVariant = "neutral" | "pink" | "purple" | "success";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  icon?: ReactNode;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-cream text-muted",
  pink: "bg-blush text-primary-dark",
  purple: "bg-purple text-purple-foreground",
  success: "bg-success text-success-foreground",
};

export function Badge({
  children,
  className,
  icon,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        "[&_svg]:h-3.5 [&_svg]:w-3.5",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}
