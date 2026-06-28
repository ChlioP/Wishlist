import { Gift, X } from "lucide-react";

import {
  WishlistItemForm,
  type WishlistItemFormValues,
} from "@/components/wishlist/WishlistItemForm";
import { Button } from "@/components/ui/Button";
import { useModalDialog } from "@/hooks/useModalDialog";
import type { WishlistItem } from "@/types/domain";

interface AddItemDrawerProps {
  item?: WishlistItem | null;
  onClose: () => void;
  onSubmit: (values: WishlistItemFormValues) => Promise<void>;
  open: boolean;
}

export function AddItemDrawer({
  item,
  onClose,
  onSubmit,
  open,
}: AddItemDrawerProps) {
  const dialogRef = useModalDialog<HTMLElement>(open, onClose);

  if (!open) return null;

  return (
    <div
      aria-label={item ? "Edit wishlist item" : "Add wishlist item"}
      aria-modal="true"
      className="fixed inset-0 z-50"
      role="dialog"
    >
      <button
        aria-label="Close item drawer"
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
        type="button"
      />
      <section
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-cream shadow-2xl"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="flex items-start justify-between gap-4 border-b border-soft bg-white px-5 py-5 sm:px-7">
          <div className="flex gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blush text-primary-dark">
              <Gift aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-2xl text-ink">
                {item ? "Edit your wish" : "Add a wish"}
              </h2>
              <p className="mt-1 text-xs text-muted">
                Add a product link or enter the details manually.
              </p>
            </div>
          </div>
          <Button
            aria-label="Close drawer"
            onClick={onClose}
            size="icon"
            variant="ghost"
          >
            <X aria-hidden="true" />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          <WishlistItemForm
            item={item}
            onCancel={onClose}
            onSubmit={onSubmit}
          />
        </div>
      </section>
    </div>
  );
}
