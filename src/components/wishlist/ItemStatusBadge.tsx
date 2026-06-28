import { Badge } from "@/components/ui/Badge";
import { itemStatusPresentation } from "@/features/wishlist/itemStatus";
import type { WishlistItemStatus } from "@/types/domain";

interface ItemStatusBadgeProps {
  status: WishlistItemStatus;
}

export function ItemStatusBadge({ status }: ItemStatusBadgeProps) {
  const config = itemStatusPresentation[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
