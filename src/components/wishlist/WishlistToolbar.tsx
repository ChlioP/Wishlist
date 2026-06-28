import { Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import type { Wishlist } from "@/types/domain";

interface WishlistToolbarProps {
  onAdd: () => void;
  onWishlistChange: (wishlistId: string) => void;
  selectedWishlistId: string;
  wishlists: Wishlist[];
}

export function WishlistToolbar({
  onAdd,
  onWishlistChange,
  selectedWishlistId,
  wishlists,
}: WishlistToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-soft bg-white p-4 shadow-card sm:flex-row sm:items-end sm:justify-between">
      <label className="block min-w-0 flex-1 text-xs font-medium text-muted sm:max-w-sm">
        Wishlist
        <select
          className="mt-2 min-h-11 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm text-ink"
          onChange={(event) => onWishlistChange(event.target.value)}
          value={selectedWishlistId}
        >
          {wishlists.map((wishlist) => (
            <option key={wishlist.id} value={wishlist.id}>
              {wishlist.title}
            </option>
          ))}
        </select>
      </label>
      <Button leftIcon={<Plus aria-hidden="true" />} onClick={onAdd}>
        Add Item
      </Button>
    </div>
  );
}
