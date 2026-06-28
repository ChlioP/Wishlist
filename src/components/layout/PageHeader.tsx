import type { ReactNode } from "react";

export interface PageHeaderProps {
  action?: ReactNode;
  eyebrow?: string;
  subtitle?: string;
  title: string;
}

export function PageHeader({
  action,
  eyebrow,
  subtitle,
  title,
}: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-dark">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
