import {
  Bell,
  Eye,
  Gift,
  UserPlus,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "@/components/ui/Card";
import type { Notification, NotificationType } from "@/types/domain";

interface RecentNotificationsProps {
  notifications: Notification[];
}

const notificationIcon: Record<NotificationType, LucideIcon> = {
  room_invitation: UsersRound,
  join_request: UserPlus,
  member_joined: UserPlus,
  visibility_changed: Eye,
  item_reserved: Gift,
  item_purchased: Gift,
};

const notificationText: Record<NotificationType, string> = {
  room_invitation: "You received a room invitation.",
  join_request: "A member requested to join your room.",
  member_joined: "A new member joined your room.",
  visibility_changed: "Wishlist visibility settings changed.",
  item_reserved: "A wishlist item was reserved.",
  item_purchased: "A wishlist item was purchased.",
};

export function RecentNotifications({
  notifications,
}: RecentNotificationsProps) {
  const recent = notifications.slice(0, 4);

  return (
    <section aria-labelledby="recent-notifications-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2
          className="flex items-center gap-2 text-sm font-semibold text-ink"
          id="recent-notifications-heading"
        >
          <span className="h-2 w-2 rounded-full bg-primary" />
          Recent notifications
        </h2>
        <Link
          className="text-xs font-medium text-primary-dark hover:underline"
          to="/notifications"
        >
          View all
        </Link>
      </div>
      <Card padding="none">
        {recent.length > 0 ? (
          <div className="divide-y divide-soft">
            {recent.map((notification) => {
              const Icon = notificationIcon[notification.type];
              return (
                <div className="flex gap-3 px-5 py-4" key={notification.id}>
                  <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-blush text-primary-dark">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                    {!notification.readAt ? (
                      <span
                        aria-label="Unread"
                        className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-primary"
                      />
                    ) : null}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs leading-5 text-ink">
                      {notificationText[notification.type]}
                    </p>
                    <time
                      className="mt-1 block text-[10px] text-muted"
                      dateTime={notification.createdAt}
                    >
                      {formatRelativeDate(notification.createdAt)}
                    </time>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-44 flex-col items-center justify-center px-5 text-center">
            <Bell aria-hidden="true" className="h-5 w-5 text-primary-dark" />
            <p className="mt-3 text-sm font-medium text-ink">All caught up</p>
            <p className="mt-1 text-xs text-muted">No notifications yet.</p>
          </div>
        )}
      </Card>
    </section>
  );
}

function formatRelativeDate(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
