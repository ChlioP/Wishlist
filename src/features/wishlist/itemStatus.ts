import type { WishlistItemStatus } from "@/types/domain";

interface ItemStatusPresentation {
  label: string;
  variant: "neutral" | "pink" | "purple" | "success";
}

export const itemStatusPresentation: Record<
  WishlistItemStatus,
  ItemStatusPresentation
> = {
  available: { label: "Available", variant: "success" },
  reserved: { label: "Reserved", variant: "pink" },
  purchased: { label: "Purchased", variant: "purple" },
  out_of_stock: { label: "Out of stock", variant: "neutral" },
  removed: { label: "Removed", variant: "neutral" },
};
