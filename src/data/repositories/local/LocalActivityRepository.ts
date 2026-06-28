import type { ActivityRepository } from "@/data/repositories/contracts";
import {
  createId,
  now,
  requireRoom,
  requireUser,
} from "@/data/repositories/local/helpers";
import {
  localMockStore,
  type LocalMockStore,
} from "@/data/repositories/local/LocalMockStore";
import type {
  ActivityEvent,
  EntityId,
} from "@/types/domain";

function newestFirst(events: ActivityEvent[]): ActivityEvent[] {
  return events.sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export class LocalActivityRepository implements ActivityRepository {
  constructor(private readonly store: LocalMockStore = localMockStore) {}

  async listForUser(userId: EntityId): Promise<ActivityEvent[]> {
    const database = this.store.read();
    requireUser(database.users, userId);
    return newestFirst(
      database.activityEvents.filter(
        (event) => event.actorUserId === userId,
      ),
    );
  }

  async listForRoom(roomId: EntityId): Promise<ActivityEvent[]> {
    const database = this.store.read();
    requireRoom(database.rooms, roomId);
    return newestFirst(
      database.activityEvents.filter((event) => event.roomId === roomId),
    );
  }

  async append(
    event: Omit<ActivityEvent, "id" | "createdAt">,
  ): Promise<ActivityEvent> {
    const database = this.store.read();
    requireUser(database.users, event.actorUserId);
    if (event.roomId) {
      requireRoom(database.rooms, event.roomId);
    }
    const created: ActivityEvent = {
      ...event,
      id: createId("activity"),
      createdAt: now(),
    };
    this.store.mutate((next) => {
      next.activityEvents.push(created);
    });
    return created;
  }
}
