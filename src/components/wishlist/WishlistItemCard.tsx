import { ExternalLink, Gift, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { ItemStatusBadge } from "@/components/wishlist/ItemStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { WishlistItem } from "@/types/domain";

interface WishlistItemCardProps {
  item: WishlistItem;
  onDelete: (item: WishlistItem) => void;
  onEdit: (item: WishlistItem) => void;
}

export function WishlistItemCard({
  item,
  onDelete,
  onEdit,
}: WishlistItemCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden" padding="none">
      <div className="relative grid h-36 place-items-center bg-gradient-to-br from-blush via-cream to-purple">
        {item.imageUrl ? (
          <img
            alt=""
            className="h-full w-full object-cover"
            src={item.imageUrl}
          />
        ) : (
          <Gift aria-hidden="true" className="h-9 w-9 text-primary-dark/70" />
        )}
        <div className="absolute right-3 top-3 flex gap-1">
          <Button
            aria-label={`Edit ${item.name}`}
            className="bg-white/90"
            onClick={() => onEdit(item)}
            size="icon"
            variant="secondary"
          >
            <Pencil aria-hidden="true" />
          </Button>
          <Button
            aria-label={`Delete ${item.name}`}
            className="bg-white/90"
            onClick={() => onDelete(item)}
            size="icon"
            variant="secondary"
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-ink">
              {item.name}
            </h3>
            <p className="mt-1 font-display text-xl text-primary-dark">
              {formatPrice(item.estimatedPriceCents, item.currency)}
            </p>
          </div>
          <MoreHorizontal
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-muted"
          />
        </div>
        {item.description ? (
          <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted">
            {item.description}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          <ItemStatusBadge status={item.status} />
          <Badge className="capitalize">{item.priority}</Badge>
          {item.category ? <Badge>{item.category}</Badge> : null}
        </div>
        {item.productUrl ? (
          <a
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary-dark hover:underline"
            href={item.productUrl}
            rel="noreferrer"
            target="_blank"
          >
            View product
            <ExternalLink aria-hidden="true" className="h-3 w-3" />
          </a>
        ) : null}
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
    currency,
    style: "currency",
  }).format(priceInCents / 100);
}
