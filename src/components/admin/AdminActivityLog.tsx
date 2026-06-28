import { Activity } from "lucide-react";

import { Card } from "@/components/ui/Card";
import type { ActivityEvent } from "@/types/domain";

interface AdminActivityLogProps {
  events: ActivityEvent[];
}

const actionLabels: Record<ActivityEvent["action"], string> = {
  room_created: "Created the room",
  room_joined: "Joined the room",
  room_updated: "Updated room settings",
  member_added: "Added a room member",
  member_removed: "Removed a room member",
  role_changed: "Changed a member role",
  visibility_changed: "Changed wishlist visibility",
  item_added: "Added a wishlist item",
  item_updated: "Updated a wishlist item",
  item_removed: "Removed a wishlist item",
  item_reserved: "Reserved a wishlist item",
  item_purchased: "Purchased a wishlist item",
};

export function AdminActivityLog({ events }: AdminActivityLogProps) {
  return (
    <section aria-labelledby="admin-activity-heading">
      <h2
        className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink"
        id="admin-activity-heading"
      >
        <span className="h-2 w-2 rounded-full bg-primary" />
        Recent room activity
      </h2>
      <Card padding="none">
        {events.length > 0 ? (
          <ol className="divide-y divide-soft">
            {events.slice(0, 8).map((event) => (
              <li className="flex gap-3 px-5 py-4" key={event.id}>
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-blush text-primary-dark">
                  <Activity aria-hidden="true" className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm text-ink">
                    {actionLabels[event.action]}
                  </p>
                  <time
                    className="mt-1 block text-xs text-muted"
                    dateTime={event.createdAt}
                  >
                    {formatDate(event.createdAt)}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-muted">
            No room activity has been recorded.
          </p>
        )}
      </Card>
    </section>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}
