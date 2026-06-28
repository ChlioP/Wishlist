import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useModalDialog } from "@/hooks/useModalDialog";
import type { WishlistItem } from "@/types/domain";

interface DeleteItemDialogProps {
  item: WishlistItem | null;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteItemDialog({
  item,
  onCancel,
  onConfirm,
}: DeleteItemDialogProps) {
  const dialogRef = useModalDialog<HTMLDivElement>(Boolean(item), onCancel);
  if (!item) return null;

  return (
    <div
      aria-labelledby="delete-item-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center px-5"
      role="alertdialog"
    >
      <button
        aria-label="Cancel item deletion"
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
        onClick={onCancel}
        type="button"
      />
      <div
        className="relative w-full max-w-md rounded-card border border-soft bg-white p-6 shadow-soft"
        ref={dialogRef}
        tabIndex={-1}
      >
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle aria-hidden="true" className="h-5 w-5" />
        </span>
        <h2 className="mt-5 font-display text-2xl text-ink" id="delete-item-title">
          Remove this item?
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          “{item.name}” will be removed from this wishlist. This mock action
          cannot be undone from the interface.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button onClick={() => void onConfirm()} variant="danger">
            Remove item
          </Button>
        </div>
      </div>
    </div>
  );
}
