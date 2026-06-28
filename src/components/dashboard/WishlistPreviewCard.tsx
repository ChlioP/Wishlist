import { Gift, Heart } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type {
  Wishlist,
  WishlistItem,
  WishlistItemStatus,
} from "@/types/domain";

export interface WishlistPreview {
  items: WishlistItem[];
  roomName: string;
  wishlist: Wishlist;
}

interface WishlistPreviewCardProps {
  preview: WishlistPreview;
}

const statusVariant: Record<
  WishlistItemStatus,
  "neutral" | "pink" | "purple" | "success"
> = {
  available: "success",
  reserved: "pink",
  purchased: "purple",
  removed: "neutral",
  out_of_stock: "neutral",
};

export function WishlistPreviewCard({
  preview,
}: WishlistPreviewCardProps) {
  const visibleItems = preview.items.slice(0, 3);

  return (
    <Card className="overflow-hidden" padding="none">
      <div className="flex items-center gap-3 border-b border-soft px-5 py-4">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-lavender text-white">
          <Heart aria-hidden="true" className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-ink">
            {preview.wishlist.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            {preview.roomName} · {preview.items.length} items
          </p>
        </div>
        <Link
          className="text-xs font-medium text-primary-dark hover:underline"
          to={`/wishlist/${preview.wishlist.id}`}
        >
          View
        </Link>
      </div>

      <div className="space-y-3 px-5 py-4">
        {visibleItems.length > 0 ? (
          visibleItems.map((item) => (
            <div
              className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3"
              key={item.id}
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-blush text-primary-dark">
                <Gift aria-hidden="true" className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-ink">
                  {item.name}
                </p>
                <p className="mt-0.5 text-[11px] text-muted">
                  {formatPrice(item.estimatedPriceCents, item.currency)}
                </p>
              </div>
              <Badge variant={statusVariant[item.status]}>
                {item.status.replace(/_/g, " ")}
              </Badge>
            </div>
          ))
        ) : (
          <p className="py-3 text-center text-xs text-muted">
            No items have been added yet.
          </p>
        )}
      </div>
    </Card>
  );
}

function formatPrice(
  priceInCents: number | undefined,
  currency = "USD",
): string {
  if (priceInCents === undefined) return "Price not set";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(priceInCents / 100);
}
