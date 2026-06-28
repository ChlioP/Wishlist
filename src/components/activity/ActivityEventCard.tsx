import {
  DoorOpen,
  Eye,
  Gift,
  Pencil,
  Settings,
  ShoppingBag,
  UserMinus,
  UserPlus,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { formatTimestamp } from "@/lib/dates";
import type { ActivityAction, ActivityEvent } from "@/types/domain";

interface ActivityEventCardProps {
  event: ActivityEvent;
  isLast?: boolean;
}

const activityPresentation: Record<
  ActivityAction,
  { icon: LucideIcon; label: string }
> = {
  room_created: { icon: DoorOpen, label: "Created a room" },
  room_joined: { icon: UsersRound, label: "Joined a room" },
  room_updated: { icon: Settings, label: "Updated room settings" },
  member_added: { icon: UserPlus, label: "Added a room member" },
  member_removed: { icon: UserMinus, label: "Removed a room member" },
  role_changed: { icon: UsersRound, label: "Changed a member role" },
  visibility_changed: { icon: Eye, label: "Changed wishlist visibility" },
  item_added: { icon: Gift, label: "Added a wishlist item" },
  item_updated: { icon: Pencil, label: "Updated a wishlist item" },
  item_removed: { icon: Gift, label: "Removed a wishlist item" },
  item_reserved: { icon: ShoppingBag, label: "Reserved a wishlist item" },
  item_purchased: { icon: ShoppingBag, label: "Purchased a wishlist item" },
};

export function ActivityEventCard({
  event,
  isLast = false,
}: ActivityEventCardProps) {
  const presentation = activityPresentation[event.action];
  const Icon = presentation.icon;
  const timestamp = formatTimestamp(event.createdAt);
  const detail = activityDetail(event);

  return (
    <li className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4 pb-5">
      {!isLast ? (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-[1.34rem] top-11 w-px bg-soft"
        />
      ) : null}
      <span className="relative z-10 grid h-11 w-11 place-items-center rounded-2xl border border-soft bg-white text-primary-dark shadow-card">
        <Icon aria-hidden="true" className="h-4 w-4" />
      </span>
      <article className="rounded-card border border-soft bg-white p-4 shadow-card">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-sm font-semibold text-ink">
              {presentation.label}
            </h2>
            {detail ? (
              <p className="mt-1 text-xs leading-5 text-muted">{detail}</p>
            ) : null}
          </div>
          <Badge variant="neutral">Your activity</Badge>
        </div>
        <time
          className="mt-3 block text-xs text-muted"
          dateTime={event.createdAt}
          title={timestamp.absolute}
        >
          <span aria-hidden="true">{timestamp.relative}</span>
          <span className="sr-only">{timestamp.absolute}</span>
        </time>
      </article>
    </li>
  );
}

function activityDetail(event: ActivityEvent): string | null {
  const preferredKeys = [
    "roomName",
    "itemName",
    "privacyMode",
    "role",
    "userId",
  ];
  for (const key of preferredKeys) {
    const value = event.metadata[key];
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
  }
  return null;
}
