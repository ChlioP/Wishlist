import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  action?: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
}

export function EmptyState({
  action,
  description,
  icon: Icon,
  title,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush text-primary-dark">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <h2 className="mt-4 font-display text-xl text-ink">{title}</h2>
      <p className="mt-2 max-w-xs text-sm leading-6 text-muted">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
