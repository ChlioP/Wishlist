import { useEffect, useState } from "react";
import { CheckCheck } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { NotificationList } from "@/components/notifications/NotificationList";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { localRepositories } from "@/data/repositories/local";
import { useAuth } from "@/features/auth/AuthContext";
import type { Notification } from "@/types/domain";

export function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setNotifications([]);
    setLoading(true);
    setError("");
    if (!user) return;
    const currentUser = user;

    const unsubscribe = localRepositories.notifications.subscribe(
      currentUser.id,
      (nextNotifications) => {
        if (active) setNotifications(nextNotifications);
      },
    );
    void localRepositories.notifications
      .listForUser(currentUser.id)
      .then((items) => {
        if (active) setNotifications(items);
      })
      .catch(() => {
        if (active) setError("Notifications could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [user]);

  const unreadCount = notifications.filter(
    (notification) => !notification.readAt,
  ).length;

  async function markRead(notificationId: string) {
    setError("");
    try {
      await localRepositories.notifications.markRead(notificationId);
    } catch {
      setError("The notification could not be marked as read.");
    }
  }

  async function markAllRead() {
    if (!user) return;
    setError("");
    try {
      await localRepositories.notifications.markAllRead(user.id);
    } catch {
      setError("Notifications could not be updated.");
    }
  }

  return (
    <>
      <PageHeader
        action={
          unreadCount > 0 ? (
            <Button
              leftIcon={<CheckCheck aria-hidden="true" />}
              onClick={() => void markAllRead()}
              variant="secondary"
            >
              Mark all as read
            </Button>
          ) : null
        }
        subtitle={`${unreadCount} unread ${
          unreadCount === 1 ? "notification" : "notifications"
        } across your rooms.`}
        title="Notifications"
      />

      {error && notifications.length > 0 ? (
        <div
          className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <NotificationsLoadingState />
      ) : error && notifications.length === 0 ? (
        <Card className="text-center" role="alert">
          <h2 className="font-display text-2xl text-ink">
            Notifications unavailable
          </h2>
          <p className="mt-2 text-sm text-muted">{error}</p>
        </Card>
      ) : (
        <div className="mx-auto max-w-4xl">
          <NotificationList
            notifications={notifications}
            onMarkRead={markRead}
          />
        </div>
      )}
    </>
  );
}

function NotificationsLoadingState() {
  return (
    <div
      aria-live="polite"
      className="mx-auto grid max-w-4xl gap-4"
      role="status"
    >
      <span className="sr-only">Loading notifications.</span>
      {[0, 1, 2].map((item) => (
        <Card className="motion-safe:animate-pulse" key={item} padding="md">
          <div className="h-5 w-48 rounded-full bg-blush" />
          <div className="mt-4 h-4 w-full rounded-full bg-cream" />
          <div className="mt-2 h-4 w-2/3 rounded-full bg-cream" />
        </Card>
      ))}
    </div>
  );
}
