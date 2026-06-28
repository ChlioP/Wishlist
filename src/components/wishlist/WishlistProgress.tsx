import { CheckCircle2 } from "lucide-react";

import { Card } from "@/components/ui/Card";
import type { WishlistItem } from "@/types/domain";

interface WishlistProgressProps {
  items: WishlistItem[];
}

export function WishlistProgress({ items }: WishlistProgressProps) {
  const completed = items.filter(
    (item) => item.status === "purchased",
  ).length;
  const percentage =
    items.length === 0 ? 0 : Math.round((completed / items.length) * 100);

  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center" padding="md">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-purple text-purple-foreground">
        <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink">Wishlist progress</p>
            <p className="mt-0.5 text-xs text-muted">
              {completed} of {items.length} items purchased
            </p>
          </div>
          <span className="font-display text-2xl text-ink">{percentage}%</span>
        </div>
        <div
          aria-label={`${percentage}% purchased`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={percentage}
          className="mt-3 h-2 overflow-hidden rounded-full bg-blush"
          role="progressbar"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-lavender transition-[width]"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
