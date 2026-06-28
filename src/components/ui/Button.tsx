import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/classes";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-primary bg-primary text-white hover:bg-primary/90 disabled:bg-primary/50",
  secondary:
    "border-soft bg-surface text-ink hover:bg-blush disabled:text-muted",
  ghost:
    "border-transparent bg-transparent text-muted hover:bg-blush hover:text-ink",
  danger:
    "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:text-red-300",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3.5 py-1.5 text-xs",
  md: "min-h-10 px-4 py-2 text-sm",
  lg: "min-h-12 px-5 py-2.5 text-sm",
  icon: "h-10 w-10 p-0",
};

export function Button({
  children,
  className,
  leftIcon,
  rightIcon,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border font-medium transition-colors active:translate-y-px disabled:cursor-not-allowed disabled:active:translate-y-0",
        "[&_svg]:h-4 [&_svg]:w-4",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      type={type}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
