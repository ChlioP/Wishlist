import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type {
  WishlistItemPriority,
  WishlistItemStatus,
} from "@/types/domain";

export interface WishlistFilterValues {
  category: string;
  priority: "all" | WishlistItemPriority;
  query: string;
  status: "all" | WishlistItemStatus;
}

interface WishlistFiltersProps {
  categories: string[];
  onChange: (filters: WishlistFilterValues) => void;
  value: WishlistFilterValues;
}

const selectClass =
  "min-h-11 rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink";

export function WishlistFilters({
  categories,
  onChange,
  value,
}: WishlistFiltersProps) {
  const hasFilters =
    value.query !== "" ||
    value.status !== "all" ||
    value.priority !== "all" ||
    value.category !== "all";

  function reset() {
    onChange({
      category: "all",
      priority: "all",
      query: "",
      status: "all",
    });
  }

  return (
    <section
      aria-label="Wishlist filters"
      className="rounded-card border border-soft bg-white p-4 shadow-card"
    >
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
        <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
        Filters
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(12rem,1fr)_auto_auto_auto_auto]">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted"
          />
          <Input
            aria-label="Search wishlist items"
            className="mt-0 pl-10"
            onChange={(event) =>
              onChange({ ...value, query: event.target.value })
            }
            placeholder="Search items"
            value={value.query}
          />
        </div>
        <select
          aria-label="Filter by status"
          className={selectClass}
          onChange={(event) =>
            onChange({
              ...value,
              status: event.target.value as WishlistFilterValues["status"],
            })
          }
          value={value.status}
        >
          <option value="all">All statuses</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="purchased">Purchased</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
        <select
          aria-label="Filter by priority"
          className={selectClass}
          onChange={(event) =>
            onChange({
              ...value,
              priority: event.target.value as WishlistFilterValues["priority"],
            })
          }
          value={value.priority}
        >
          <option value="all">All priorities</option>
          <option value="high">High priority</option>
          <option value="medium">Medium priority</option>
          <option value="low">Low priority</option>
        </select>
        <select
          aria-label="Filter by category"
          className={selectClass}
          onChange={(event) =>
            onChange({ ...value, category: event.target.value })
          }
          value={value.category}
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {hasFilters ? (
          <Button
            aria-label="Clear filters"
            onClick={reset}
            size="icon"
            variant="ghost"
          >
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </section>
  );
}
