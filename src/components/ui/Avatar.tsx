import type { HTMLAttributes } from "react";

import { cn } from "@/lib/classes";

type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  alt: string;
  fallback?: string;
  size?: AvatarSize;
  src?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-sm",
};

function initials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function Avatar({
  alt,
  className,
  fallback,
  size = "md",
  src,
  ...props
}: AvatarProps) {
  if (src) {
    return (
      <div
        className={cn(
          "shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary to-lavender",
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        <img alt={alt} className="h-full w-full object-cover" src={src} />
      </div>
    );
  }

  return (
    <div
      aria-label={alt}
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-lavender font-semibold text-white",
        sizeClasses[size],
        className,
      )}
      role="img"
      {...props}
    >
      {fallback ?? initials(alt)}
    </div>
  );
}
