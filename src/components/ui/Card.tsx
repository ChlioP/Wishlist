import type { HTMLAttributes } from "react";

import { cn } from "@/lib/classes";

type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
}

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6 sm:p-7",
};

export function Card({
  className,
  padding = "lg",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-soft bg-surface shadow-card",
        paddingClasses[padding],
        className,
      )}
      {...props}
    />
  );
}
