import type { NotificationRepository } from "@/data/repositories/contracts";
import { RepositoryError } from "@/data/repositories/errors";
import {
  now,
  requireUser,
} from "@/data/repositories/local/helpers";
import {
  localMockStore,
  type LocalMockStore,
} from "@/data/repositories/local/LocalMockStore";
import type {
  EntityId,
  Notification,
} from "@/types/domain";

function forUser(
  notifications: Notification[],
  userId: EntityId,
): Notification[] {
  return notifications
    .filter((notification) => notification.recipientUserId === userId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export class LocalNotificationRepository
  implements NotificationRepository
{
  constructor(private readonly store: LocalMockStore = localMockStore) {}

  async listForUser(userId: EntityId): Promise<Notification[]> {
    const database = this.store.read();
    requireUser(database.users, userId);
    return forUser(database.notifications, userId);
  }

  async markRead(notificationId: EntityId): Promise<Notification> {
    const database = this.store.read();
    const notification = database.notifications.find(
      (candidate) => candidate.id === notificationId,
    );
    if (!notification) {
      throw new RepositoryError("not_found", "Notification not found.");
    }
    const updated: Notification = {
      ...notification,
      readAt: notification.readAt ?? now(),
    };
    this.store.mutate((next) => {
      next.notifications = next.notifications.map((candidate) =>
        candidate.id === notificationId ? updated : candidate,
      );
    });
    return updated;
  }

  async markAllRead(userId: EntityId): Promise<void> {
    const database = this.store.read();
    requireUser(database.users, userId);
    const timestamp = now();
    this.store.mutate((next) => {
      next.notifications = next.notifications.map((notification) =>
        notification.recipientUserId === userId && !notification.readAt
          ? { ...notification, readAt: timestamp }
          : notification,
      );
    });
  }

  subscribe(
    userId: EntityId,
    listener: (notifications: Notification[]) => void,
  ): () => void {
    return this.store.subscribe((database) => {
      listener(forUser(database.notifications, userId));
    });
  }
}
