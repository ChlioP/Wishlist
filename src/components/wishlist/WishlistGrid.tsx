import { Gift } from "lucide-react";

import { WishlistItemCard } from "@/components/wishlist/WishlistItemCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { WishlistItem } from "@/types/domain";

interface WishlistGridProps {
  emptyDescription?: string;
  items: WishlistItem[];
  onDelete: (item: WishlistItem) => void;
  onEdit: (item: WishlistItem) => void;
}

export function WishlistGrid({
  emptyDescription = "Add your first wish to start building this list.",
  items,
  onDelete,
  onEdit,
}: WishlistGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-card border border-soft bg-white shadow-card">
        <EmptyState
          description={emptyDescription}
          icon={Gift}
          title="No wishlist items"
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
      {items.map((item) => (
        <WishlistItemCard
          item={item}
          key={item.id}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
