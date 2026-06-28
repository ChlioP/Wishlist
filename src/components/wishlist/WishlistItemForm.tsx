import { useEffect, useState } from "react";

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
}

const emptyValues: WishlistItemFormValues = {
  category: "",
  currency: "USD",
  description: "",
  estimatedPrice: "",
  imageUrl: "",
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
        <Button onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button disabled={submitting} type="submit">
          {submitting ? "Saving…" : item ? "Save changes" : "Add item"}
        </Button>
      </div>
    </form>
  );
}
