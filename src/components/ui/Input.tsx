import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/classes";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  hint?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, hint, id, label, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const descriptionId = `${inputId}-description`;
    const description = error ?? hint;

    return (
      <label className="block text-sm font-medium text-ink" htmlFor={inputId}>
        {label ? <span>{label}</span> : null}
        <input
          aria-describedby={description ? descriptionId : undefined}
          aria-invalid={Boolean(error)}
          className={cn(
            "mt-2 block min-h-11 w-full rounded-2xl border bg-surface px-4 py-2.5 text-sm text-ink shadow-sm",
            "placeholder:text-muted/70 disabled:cursor-not-allowed disabled:bg-cream disabled:text-muted",
            error ? "border-red-300" : "border-black/10 hover:border-soft",
            className,
          )}
          id={inputId}
          ref={ref}
          {...props}
        />
        {description ? (
          <span
            className={cn(
              "mt-1.5 block text-xs",
              error ? "text-red-600" : "text-muted",
            )}
            id={descriptionId}
          >
            {description}
          </span>
        ) : null}
      </label>
    );
  },
);

Input.displayName = "Input";
