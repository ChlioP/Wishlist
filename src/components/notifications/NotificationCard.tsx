import {
  Check,
  Eye,
  Gift,
  UserPlus,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatTimestamp } from "@/lib/dates";
import { cn } from "@/lib/classes";
import type { Notification, NotificationType } from "@/types/domain";

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (notificationId: string) => Promise<void>;
}

const notificationPresentation: Record<
  NotificationType,
  { icon: LucideIcon; title: string }
> = {
  room_invitation: {
    icon: UsersRound,
    title: "Room invitation",
  },
  join_request: {
    icon: UserPlus,
    title: "New join request",
  },
  member_joined: {
    icon: UserPlus,
    title: "New room member",
  },
  visibility_changed: {
    icon: Eye,
    title: "Visibility changed",
  },
  item_reserved: {
    icon: Gift,
    title: "Item reserved",
  },
  item_purchased: {
    icon: Gift,
    title: "Item purchased",
  },
};

const fallbackMessages: Record<NotificationType, string> = {
  room_invitation: "You were invited to join a room.",
  join_request: "Someone requested to join your room.",
  member_joined: "A new member joined your room.",
  visibility_changed: "Wishlist visibility permissions were updated.",
  item_reserved: "A wishlist item was reserved.",
  item_purchased: "A wishlist item was marked as purchased.",
};

export function NotificationCard({
  notification,
  onMarkRead,
}: NotificationCardProps) {
  const presentation = notificationPresentation[notification.type];
  const Icon = presentation.icon;
  const unread = !notification.readAt;
  const timestamp = formatTimestamp(notification.createdAt);

  return (
    <article
      aria-label={`${unread ? "Unread" : "Read"} notification: ${presentation.title}`}
      className={cn(
        "relative rounded-card border p-5 shadow-card transition-colors",
        unread
          ? "border-primary/50 bg-blush/45"
          : "border-soft bg-white",
      )}
    >
      {unread ? (
        <span
          aria-hidden="true"
          className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-primary"
        />
      ) : null}
      <div className="flex gap-4">
        <span
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-2xl",
            unread
              ? "bg-primary text-white"
              : "bg-cream text-primary-dark",
          )}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 pr-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-ink">
              {presentation.title}
            </h2>
            <Badge variant={unread ? "pink" : "neutral"}>
              {unread ? "Unread" : "Read"}
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            {notificationMessage(notification)}
          </p>
          <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <time
              className="text-xs text-muted"
              dateTime={notification.createdAt}
              title={timestamp.absolute}
            >
              <span aria-hidden="true">{timestamp.relative}</span>
              <span className="sr-only">{timestamp.absolute}</span>
            </time>
            {unread ? (
              <Button
                leftIcon={<Check aria-hidden="true" />}
                onClick={() => void onMarkRead(notification.id)}
                size="sm"
                variant="secondary"
              >
                Mark as read
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function notificationMessage(notification: Notification): string {
  const roomName = notification.metadata.roomName;
  const requesterName = notification.metadata.requesterName;
  if (notification.type === "join_request" && typeof requesterName === "string") {
    return `${requesterName} requested to join${
      typeof roomName === "string" ? ` ${roomName}` : " your room"
    }.`;
  }
  if (
    notification.type === "visibility_changed" &&
    typeof roomName === "string"
  ) {
    return `Wishlist visibility changed in ${roomName}.`;
  }
  return fallbackMessages[notification.type];
}
