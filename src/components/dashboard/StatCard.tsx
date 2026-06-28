import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/Card";

export interface StatCardProps {
  detail: string;
  icon: LucideIcon;
  label: string;
  value: number;
}

export function StatCard({
  detail,
  icon: Icon,
  label,
  value,
}: StatCardProps) {
  return (
    <Card className="relative overflow-hidden" padding="md">
      <span
        aria-hidden="true"
        className="absolute -right-6 -top-7 h-24 w-24 rounded-full bg-blush/70"
      />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {label}
          </p>
          <p className="mt-3 font-display text-4xl leading-none text-ink">
            {value}
          </p>
          <p className="mt-3 text-xs text-primary-dark">{detail}</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blush text-primary-dark">
          <Icon aria-hidden="true" className="h-4 w-4" />
        </span>
      </div>
    </Card>
  );
}
