import { useEffect, useState } from "react";
import { ImageUp } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type {
  WishlistItem,
  WishlistItemPriority,
  WishlistItemStatus,
} from "@/types/domain";

export interface WishlistItemFormValues {
  category: string;
  currency: string;
  description: string;
  estimatedPrice: string;
  imageUrl: string;
  imageFile: File | null;
  name: string;
  notes: string;
  priority: WishlistItemPriority;
  productUrl: string;
  quantityDesired: string;
  status: WishlistItemStatus;
}

interface WishlistItemFormProps {
  item?: WishlistItem | null;
  onCancel: () => void;
  onSubmit: (values: WishlistItemFormValues) => Promise<void>;
  uploadError?: string;
  uploading?: boolean;
}

const emptyValues: WishlistItemFormValues = {
  category: "",
  currency: "USD",
  description: "",
  estimatedPrice: "",
  imageUrl: "",
  imageFile: null,
  name: "",
  notes: "",
  priority: "medium",
  productUrl: "",
  quantityDesired: "1",
  status: "available",
};

const fieldClass =
  "mt-2 min-h-11 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm text-ink";

export function WishlistItemForm({
  item,
  onCancel,
  onSubmit,
  uploadError,
  uploading = false,
}: WishlistItemFormProps) {
  const [values, setValues] = useState(emptyValues);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValues(
      item
        ? {
            category: item.category ?? "",
            currency: item.currency ?? "USD",
            description: item.description ?? "",
            estimatedPrice:
              item.estimatedPriceCents === undefined
                ? ""
                : String(item.estimatedPriceCents / 100),
            imageUrl: item.imageUrl ?? "",
            imageFile: null,
            name: item.name,
            notes: item.notes ?? "",
            priority: item.priority,
            productUrl: item.productUrl ?? "",
            quantityDesired: String(item.quantityDesired),
            status: item.status,
          }
        : emptyValues,
    );
    setError("");
  }, [item]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.name.trim()) {
      setError("Item name is required.");
      return;
    }
    if (Number(values.quantityDesired) < 1) {
      setError("Quantity must be at least one.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(values);
    } catch {
      setError("The item could not be saved.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Input
        autoFocus
        error={error || undefined}
        label="Item name"
        onChange={(event) =>
          setValues((current) => ({ ...current, name: event.target.value }))
        }
        placeholder="Noise-cancelling headphones"
        value={values.name}
      />

      <label className="block text-sm font-medium text-ink">
        Description
        <textarea
          className={`${fieldClass} min-h-24 resize-y`}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          placeholder="Size, color, or other useful details"
          value={values.description}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Category"
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              category: event.target.value,
            }))
          }
          placeholder="Electronics"
          value={values.category}
        />
        <label className="block text-sm font-medium text-ink">
          Priority
          <select
            className={fieldClass}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                priority: event.target.value as WishlistItemPriority,
              }))
            }
            value={values.priority}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          inputMode="decimal"
          label="Estimated price"
          min="0"
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              estimatedPrice: event.target.value,
            }))
          }
          placeholder="49.99"
          step="0.01"
          type="number"
          value={values.estimatedPrice}
        />
        <Input
          inputMode="numeric"
          label="Quantity"
          min="1"
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              quantityDesired: event.target.value,
            }))
          }
          type="number"
          value={values.quantityDesired}
        />
      </div>

      <Input
        label="Product URL"
        onChange={(event) =>
          setValues((current) => ({
            ...current,
            productUrl: event.target.value,
          }))
        }
        placeholder="https://"
        type="url"
        value={values.productUrl}
      />
      <Input
        label="Image URL"
        onChange={(event) =>
          setValues((current) => ({
            ...current,
            imageUrl: event.target.value,
          }))
        }
        placeholder="https://"
        type="url"
        value={values.imageUrl}
      />
      <label className="block text-sm font-medium text-ink">
        Upload image
        <span className="mt-2 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-soft bg-white px-4 py-4 text-center transition-colors hover:bg-blush/40 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-dark">
          <ImageUp
            aria-hidden="true"
            className="h-5 w-5 text-primary-dark"
          />
          <span className="mt-2 text-xs font-medium text-ink">
            {values.imageFile
              ? values.imageFile.name
              : "Choose an image file"}
          </span>
          <span className="mt-1 text-xs text-muted">
            JPEG, PNG, WebP, or GIF
          </span>
          <input
            accept="image/gif,image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                imageFile: event.target.files?.[0] ?? null,
              }))
            }
            type="file"
          />
        </span>
      </label>

      {uploadError ? (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {uploadError}
        </div>
      ) : null}
      {uploading ? (
        <div
          aria-live="polite"
          className="rounded-2xl border border-soft bg-blush/50 px-4 py-3 text-sm text-primary-dark"
          role="status"
        >
          Uploading image…
        </div>
      ) : null}

      {item ? (
        <label className="block text-sm font-medium text-ink">
          Status
          <select
            className={fieldClass}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                status: event.target.value as WishlistItemStatus,
              }))
            }
            value={values.status}
          >
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="purchased">Purchased</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </label>
      ) : null}

      <label className="block text-sm font-medium text-ink">
        Notes
        <textarea
          className={`${fieldClass} min-h-20 resize-y`}
          onChange={(event) =>
            setValues((current) => ({ ...current, notes: event.target.value }))
          }
          value={values.notes}
        />
      </label>

      <div className="flex justify-end gap-3 border-t border-soft pt-5">
        <Button disabled={uploading} onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button disabled={submitting || uploading} type="submit">
          {uploading
            ? "Uploading image…"
            : submitting
              ? "Saving…"
              : item
                ? "Save changes"
                : "Add item"}
        </Button>
      </div>
    </form>
  );
}
