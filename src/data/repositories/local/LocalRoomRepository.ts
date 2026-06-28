import type {
  RoomMember,
  RoomRepository,
} from "@/data/repositories/contracts";
import { RepositoryError } from "@/data/repositories/errors";
import {
  createId,
  now,
  requireMembership,
  requireRoom,
  requireUser,
} from "@/data/repositories/local/helpers";
import {
  localMockStore,
  type LocalMockStore,
} from "@/data/repositories/local/LocalMockStore";
import { canManageRoom } from "@/features/permissions/permissionRules";
import type {
  EntityId,
  JoinRequest,
  Room,
  RoomMembership,
  RoomPrivacyMode,
  RoomRole,
  VisibilityGrant,
} from "@/types/domain";

function inviteCode(name: string): string {
  const prefix = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 12);
  return `${prefix || "ROOM"}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export class LocalRoomRepository implements RoomRepository {
  constructor(private readonly store: LocalMockStore = localMockStore) {}

  async listForUser(userId: EntityId): Promise<Room[]> {
    const database = this.store.read();
    const roomIds = new Set(
      database.memberships
        .filter(
          (membership) =>
            membership.userId === userId && membership.status === "active",
        )
        .map((membership) => membership.roomId),
    );
    return database.rooms.filter((room) => roomIds.has(room.id));
  }

  async getById(roomId: EntityId): Promise<Room | null> {
    return this.store.read().rooms.find((room) => room.id === roomId) ?? null;
  }

  async create(input: {
    name: string;
    description?: string;
    ownerId: EntityId;
  }): Promise<Room> {
    const name = input.name.trim();
    if (!name) {
      throw new RepositoryError("validation", "Room name is required.");
    }

    const database = this.store.read();
    requireUser(database.users, input.ownerId);
    const timestamp = now();
    const room: Room = {
      id: createId("room"),
      name,
      description: input.description?.trim() || undefined,
      inviteCode: inviteCode(name),
      privacyMode: "private",
      ownerId: input.ownerId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const membership: RoomMembership = {
      id: createId("membership"),
      roomId: room.id,
      userId: input.ownerId,
      role: "owner",
      status: "active",
      joinedAt: timestamp,
    };

    this.store.mutate((next) => {
      next.rooms.push(room);
      next.memberships.push(membership);
    });
    return room;
  }

  async update(
    roomId: EntityId,
    patch: Partial<Pick<Room, "name" | "description" | "privacyMode">>,
  ): Promise<Room> {
    const database = this.store.read();
    const room = requireRoom(database.rooms, roomId);
    this.assertCurrentUserCanManage(database.currentUserId, room);
    const updated: Room = { ...room, ...patch, updatedAt: now() };
    this.store.mutate((next) => {
      next.rooms = next.rooms.map((candidate) =>
        candidate.id === roomId ? updated : candidate,
      );
    });
    return updated;
  }

  async deleteRoom(roomId: EntityId): Promise<void> {
    const database = this.store.read();
    const room = requireRoom(database.rooms, roomId);
    this.assertCurrentUserCanManage(database.currentUserId, room);
    const wishlistIds = new Set(
      database.wishlists
        .filter((wishlist) => wishlist.roomId === roomId)
        .map((wishlist) => wishlist.id),
    );
    const itemIds = new Set(
      database.wishlistItems
        .filter((item) => wishlistIds.has(item.wishlistId))
        .map((item) => item.id),
    );

    this.store.mutate((next) => {
      next.rooms = next.rooms.filter((candidate) => candidate.id !== roomId);
      next.memberships = next.memberships.filter(
        (membership) => membership.roomId !== roomId,
      );
      next.visibilityGrants = next.visibilityGrants.filter(
        (grant) => grant.roomId !== roomId,
      );
      next.joinRequests = next.joinRequests.filter(
        (request) => request.roomId !== roomId,
      );
      next.wishlists = next.wishlists.filter(
        (wishlist) => wishlist.roomId !== roomId,
      );
      next.wishlistItems = next.wishlistItems.filter(
        (item) => !wishlistIds.has(item.wishlistId),
      );
      next.reservations = next.reservations.filter(
        (reservation) =>
          reservation.roomId !== roomId && !itemIds.has(reservation.itemId),
      );
      next.activityEvents = next.activityEvents.filter(
        (event) => event.roomId !== roomId,
      );
      next.notifications = next.notifications.filter(
        (notification) => notification.roomId !== roomId,
      );
    });
  }

  async joinByCode(
    userId: EntityId,
    code: string,
  ): Promise<RoomMembership> {
    const database = this.store.read();
    requireUser(database.users, userId);
    const room = database.rooms.find(
      (candidate) =>
        candidate.inviteCode.toLowerCase() === code.trim().toLowerCase(),
    );
    if (!room) {
      throw new RepositoryError("not_found", "Room code was not found.");
    }

    const existing = database.memberships.find(
      (membership) =>
        membership.roomId === room.id && membership.userId === userId,
    );
    if (existing?.status === "active") {
      throw new RepositoryError("conflict", "User already belongs to room.");
    }

    const membership: RoomMembership = {
      id: existing?.id ?? createId("membership"),
      roomId: room.id,
      userId,
      role: "member",
      status: "active",
      joinedAt: now(),
    };
    this.store.mutate((next) => {
      next.memberships = existing
        ? next.memberships.map((candidate) =>
            candidate.id === existing.id ? membership : candidate,
          )
        : [...next.memberships, membership];
    });
    return membership;
  }

  async leave(roomId: EntityId, userId: EntityId): Promise<void> {
    const database = this.store.read();
    const room = requireRoom(database.rooms, roomId);
    if (room.ownerId === userId) {
      throw new RepositoryError(
        "forbidden",
        "Room ownership must be transferred before leaving.",
      );
    }
    requireMembership(database.memberships, roomId, userId);
    this.store.mutate((next) => {
      next.memberships = next.memberships.map((membership) =>
        membership.roomId === roomId && membership.userId === userId
          ? { ...membership, status: "removed" }
          : membership,
      );
    });
  }

  async listMembers(roomId: EntityId): Promise<RoomMember[]> {
    const database = this.store.read();
    requireRoom(database.rooms, roomId);
    return database.memberships
      .filter(
        (membership) =>
          membership.roomId === roomId && membership.status === "active",
      )
      .map((membership) => ({
        ...membership,
        user: requireUser(database.users, membership.userId),
      }));
  }

  async changeRole(
    roomId: EntityId,
    userId: EntityId,
    role: RoomRole,
  ): Promise<RoomMembership> {
    const database = this.store.read();
    const room = requireRoom(database.rooms, roomId);
    this.assertCurrentOwner(database.currentUserId, room);
    const membership = requireMembership(
      database.memberships,
      roomId,
      userId,
    );
    if (membership.role === "owner" || role === "owner") {
      throw new RepositoryError(
        "forbidden",
        "Ownership transfer is not supported by this operation.",
      );
    }
    const updated = { ...membership, role };
    this.store.mutate((next) => {
      next.memberships = next.memberships.map((candidate) =>
        candidate.id === membership.id ? updated : candidate,
      );
    });
    return updated;
  }

  async removeMember(roomId: EntityId, userId: EntityId): Promise<void> {
    const database = this.store.read();
    const room = requireRoom(database.rooms, roomId);
    const actorId = this.assertCurrentUserCanManage(
      database.currentUserId,
      room,
    );
    const actorMembership = requireMembership(
      database.memberships,
      roomId,
      actorId,
    );
    const membership = requireMembership(
      database.memberships,
      roomId,
      userId,
    );
    if (membership.role === "owner") {
      throw new RepositoryError("forbidden", "The room owner cannot be removed.");
    }
    if (
      membership.role === "admin" &&
      actorMembership.role !== "owner"
    ) {
      throw new RepositoryError(
        "forbidden",
        "Only the room owner can remove an administrator.",
      );
    }
    this.store.mutate((next) => {
      next.memberships = next.memberships.map((candidate) =>
        candidate.id === membership.id
          ? { ...candidate, status: "removed" }
          : candidate,
      );
    });
  }

  async listJoinRequests(roomId: EntityId): Promise<JoinRequest[]> {
    const database = this.store.read();
    const room = requireRoom(database.rooms, roomId);
    this.assertCurrentUserCanManage(database.currentUserId, room);
    return database.joinRequests.filter((request) => request.roomId === roomId);
  }

  async reviewJoinRequest(
    requestId: EntityId,
    decision: "approved" | "rejected",
  ): Promise<JoinRequest> {
    const database = this.store.read();
    const request = database.joinRequests.find(
      (candidate) => candidate.id === requestId,
    );
    if (!request) {
      throw new RepositoryError("not_found", "Join request not found.");
    }
    const room = requireRoom(database.rooms, request.roomId);
    const reviewerId = this.assertCurrentUserCanManage(
      database.currentUserId,
      room,
    );
    const updated: JoinRequest = {
      ...request,
      status: decision,
      reviewedByUserId: reviewerId,
      reviewedAt: now(),
    };
    this.store.mutate((next) => {
      next.joinRequests = next.joinRequests.map((candidate) =>
        candidate.id === requestId ? updated : candidate,
      );
      if (decision === "approved") {
        const existing = next.memberships.find(
          (membership) =>
            membership.roomId === request.roomId &&
            membership.userId === request.userId,
        );
        if (existing) {
          existing.status = "active";
          existing.role = "member";
        } else {
          next.memberships.push({
            id: createId("membership"),
            roomId: request.roomId,
            userId: request.userId,
            role: "member",
            status: "active",
            joinedAt: now(),
          });
        }
      }
    });
    return updated;
  }

  async listVisibilityGrants(
    roomId: EntityId,
  ): Promise<VisibilityGrant[]> {
    const database = this.store.read();
    requireRoom(database.rooms, roomId);
    return database.visibilityGrants.filter(
      (grant) => grant.roomId === roomId,
    );
  }

  async setVisibilityGrant(input: {
    roomId: EntityId;
    viewerUserId: EntityId;
    wishlistOwnerId: EntityId;
    grantedByUserId: EntityId;
    allowed: boolean;
  }): Promise<void> {
    const database = this.store.read();
    const room = requireRoom(database.rooms, input.roomId);
    if (database.currentUserId !== input.grantedByUserId) {
      throw new RepositoryError(
        "forbidden",
        "Visibility changes must be attributed to the signed-in user.",
      );
    }
    const actorMembership = requireMembership(
      database.memberships,
      room.id,
      input.grantedByUserId,
    );
    const actor = requireUser(database.users, input.grantedByUserId);
    if (!canManageRoom({ actor, membership: actorMembership, room })) {
      throw new RepositoryError("forbidden", "Room management permission required.");
    }
    requireMembership(
      database.memberships,
      room.id,
      input.viewerUserId,
    );
    requireMembership(
      database.memberships,
      room.id,
      input.wishlistOwnerId,
    );
    const existing = database.visibilityGrants.find(
      (grant) =>
        grant.roomId === room.id &&
        grant.viewerUserId === input.viewerUserId &&
        grant.wishlistOwnerId === input.wishlistOwnerId,
    );
    this.store.mutate((next) => {
      if (input.allowed && !existing) {
        next.visibilityGrants.push({
          id: createId("grant"),
          roomId: room.id,
          viewerUserId: input.viewerUserId,
          wishlistOwnerId: input.wishlistOwnerId,
          grantedByUserId: input.grantedByUserId,
          createdAt: now(),
        });
      } else if (!input.allowed && existing) {
        next.visibilityGrants = next.visibilityGrants.filter(
          (grant) => grant.id !== existing.id,
        );
      }
    });
  }

  async setPrivacyMode(
    roomId: EntityId,
    privacyMode: RoomPrivacyMode,
  ): Promise<Room> {
    return this.update(roomId, { privacyMode });
  }

  private assertCurrentUserCanManage(
    currentUserId: string | null,
    room: Room,
  ): string {
    if (!currentUserId) {
      throw new RepositoryError("unauthenticated", "Sign in is required.");
    }
    const database = this.store.read();
    const actor = requireUser(database.users, currentUserId);
    const membership = requireMembership(
      database.memberships,
      room.id,
      currentUserId,
    );
    if (!canManageRoom({ actor, membership, room })) {
      throw new RepositoryError("forbidden", "Room management permission required.");
    }
    return currentUserId;
  }

  private assertCurrentOwner(
    currentUserId: string | null,
    room: Room,
  ): void {
    if (!currentUserId || currentUserId !== room.ownerId) {
      throw new RepositoryError("forbidden", "Room owner permission required.");
    }
  }
}
