import { BellRing } from "lucide-react";

import { NotificationCard } from "@/components/notifications/NotificationCard";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Notification } from "@/types/domain";

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead: (notificationId: string) => Promise<void>;
}

export function NotificationList({
  notifications,
  onMarkRead,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <Card padding="none">
        <EmptyState
          description="Room invitations and wishlist updates will appear here."
          icon={BellRing}
          title="No notifications"
        />
      </Card>
    );
  }

  return (
    <div aria-label="Notifications" className="grid gap-4">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onMarkRead={onMarkRead}
        />
      ))}
    </div>
  );
}
