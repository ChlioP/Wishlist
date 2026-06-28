import type {
  NewWishlistItem,
  WishlistItemPatch,
  WishlistRepository,
} from "@/data/repositories/contracts";
import { RepositoryError } from "@/data/repositories/errors";
import {
  createId,
  now,
  requireMembership,
  requireRoom,
  requireUser,
  requireWishlist,
  requireWishlistItem,
} from "@/data/repositories/local/helpers";
import {
  localMockStore,
  type LocalMockStore,
} from "@/data/repositories/local/LocalMockStore";
import {
  canEditWishlist,
  canReserveItem,
  canViewWishlist,
} from "@/features/permissions/permissionRules";
import type {
  EntityId,
  Reservation,
  Wishlist,
  WishlistItem,
} from "@/types/domain";

export class LocalWishlistRepository implements WishlistRepository {
  constructor(private readonly store: LocalMockStore = localMockStore) {}

  async getOwn(
    roomId: EntityId,
    ownerId: EntityId,
  ): Promise<Wishlist | null> {
    return (
      this.store
        .read()
        .wishlists.find(
          (wishlist) =>
            wishlist.roomId === roomId && wishlist.ownerId === ownerId,
        ) ?? null
    );
  }

  async getVisible(
    roomId: EntityId,
    viewerId: EntityId,
  ): Promise<Wishlist[]> {
    const database = this.store.read();
    const room = requireRoom(database.rooms, roomId);
    const actor = requireUser(database.users, viewerId);
    const membership = requireMembership(
      database.memberships,
      roomId,
      viewerId,
    );

    return database.wishlists.filter((wishlist) => {
      if (wishlist.roomId !== roomId) {
        return false;
      }
      const ownerMembership = database.memberships.find(
        (candidate) =>
          candidate.roomId === roomId &&
          candidate.userId === wishlist.ownerId &&
          candidate.status === "active",
      );
      return canViewWishlist({
        actor,
        grants: database.visibilityGrants,
        membership,
        ownerMembership,
        room,
        wishlist,
      });
    });
  }

  async getById(
    wishlistId: EntityId,
    viewerId: EntityId,
  ): Promise<Wishlist | null> {
    const database = this.store.read();
    const wishlist = database.wishlists.find(
      (candidate) => candidate.id === wishlistId,
    );
    if (!wishlist) {
      return null;
    }
    return this.viewerCanAccess(database, wishlist, viewerId)
      ? wishlist
      : null;
  }

  async listItems(
    wishlistId: EntityId,
    viewerId: EntityId,
  ): Promise<WishlistItem[]> {
    const database = this.store.read();
    const wishlist = requireWishlist(database.wishlists, wishlistId);
    if (!this.viewerCanAccess(database, wishlist, viewerId)) {
      throw new RepositoryError("forbidden", "Wishlist access denied.");
    }
    return database.wishlistItems.filter(
      (item) =>
        item.wishlistId === wishlistId && item.status !== "removed",
    );
  }

  async addItem(
    wishlistId: EntityId,
    actorId: EntityId,
    input: NewWishlistItem,
  ): Promise<WishlistItem> {
    if (!input.name.trim() || input.quantityDesired < 1) {
      throw new RepositoryError(
        "validation",
        "Item name and a positive quantity are required.",
      );
    }
    const database = this.store.read();
    const actor = requireUser(database.users, actorId);
    const wishlist = requireWishlist(database.wishlists, wishlistId);
    if (!canEditWishlist(actor, wishlist)) {
      throw new RepositoryError("forbidden", "Wishlist edit permission required.");
    }
    const timestamp = now();
    const item: WishlistItem = {
      ...input,
      id: createId("item"),
      wishlistId,
      name: input.name.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.store.mutate((next) => {
      next.wishlistItems.push(item);
    });
    return item;
  }

  async updateItem(
    itemId: EntityId,
    actorId: EntityId,
    patch: WishlistItemPatch,
  ): Promise<WishlistItem> {
    const database = this.store.read();
    const actor = requireUser(database.users, actorId);
    const item = requireWishlistItem(database.wishlistItems, itemId);
    const wishlist = requireWishlist(database.wishlists, item.wishlistId);
    if (!canEditWishlist(actor, wishlist)) {
      throw new RepositoryError("forbidden", "Wishlist edit permission required.");
    }
    if (patch.name !== undefined && !patch.name.trim()) {
      throw new RepositoryError("validation", "Item name cannot be empty.");
    }
    const updated: WishlistItem = {
      ...item,
      ...patch,
      name: patch.name?.trim() ?? item.name,
      updatedAt: now(),
    };
    this.store.mutate((next) => {
      next.wishlistItems = next.wishlistItems.map((candidate) =>
        candidate.id === itemId ? updated : candidate,
      );
    });
    return updated;
  }

  async removeItem(itemId: EntityId, actorId: EntityId): Promise<void> {
    await this.updateItem(itemId, actorId, { status: "removed" });
  }

  async reserveItem(
    itemId: EntityId,
    userId: EntityId,
  ): Promise<Reservation> {
    const database = this.store.read();
    const actor = requireUser(database.users, userId);
    const item = requireWishlistItem(database.wishlistItems, itemId);
    const wishlist = requireWishlist(database.wishlists, item.wishlistId);
    const room = requireRoom(database.rooms, wishlist.roomId);
    const membership = requireMembership(
      database.memberships,
      room.id,
      userId,
    );
    const ownerMembership = requireMembership(
      database.memberships,
      room.id,
      wishlist.ownerId,
    );
    const activeReservation = database.reservations.find(
      (reservation) =>
        reservation.itemId === itemId &&
        (reservation.status === "reserved" ||
          reservation.status === "purchased"),
    );
    if (activeReservation) {
      throw new RepositoryError("conflict", "Item is already unavailable.");
    }
    if (
      !canReserveItem({
        actor,
        grants: database.visibilityGrants,
        item,
        membership,
        ownerMembership,
        room,
        wishlist,
      })
    ) {
      throw new RepositoryError("forbidden", "Item cannot be reserved.");
    }

    const timestamp = now();
    const reservation: Reservation = {
      id: createId("reservation"),
      roomId: room.id,
      itemId,
      reservedByUserId: userId,
      status: "reserved",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.store.mutate((next) => {
      next.reservations.push(reservation);
      next.wishlistItems = next.wishlistItems.map((candidate) =>
        candidate.id === itemId
          ? { ...candidate, status: "reserved", updatedAt: timestamp }
          : candidate,
      );
    });
    return reservation;
  }

  async cancelReservation(
    itemId: EntityId,
    userId: EntityId,
  ): Promise<void> {
    const database = this.store.read();
    const reservation = database.reservations.find(
      (candidate) =>
        candidate.itemId === itemId &&
        candidate.reservedByUserId === userId &&
        candidate.status === "reserved",
    );
    if (!reservation) {
      throw new RepositoryError("not_found", "Active reservation not found.");
    }
    const timestamp = now();
    this.store.mutate((next) => {
      next.reservations = next.reservations.map((candidate) =>
        candidate.id === reservation.id
          ? { ...candidate, status: "cancelled", updatedAt: timestamp }
          : candidate,
      );
      next.wishlistItems = next.wishlistItems.map((candidate) =>
        candidate.id === itemId
          ? { ...candidate, status: "available", updatedAt: timestamp }
          : candidate,
      );
    });
  }

  async markPurchased(
    itemId: EntityId,
    userId: EntityId,
  ): Promise<Reservation> {
    const database = this.store.read();
    const reservation = database.reservations.find(
      (candidate) =>
        candidate.itemId === itemId &&
        candidate.reservedByUserId === userId &&
        candidate.status === "reserved",
    );
    if (!reservation) {
      throw new RepositoryError("not_found", "Active reservation not found.");
    }
    const updated: Reservation = {
      ...reservation,
      status: "purchased",
      updatedAt: now(),
    };
    this.store.mutate((next) => {
      next.reservations = next.reservations.map((candidate) =>
        candidate.id === reservation.id ? updated : candidate,
      );
      next.wishlistItems = next.wishlistItems.map((candidate) =>
        candidate.id === itemId
          ? { ...candidate, status: "purchased", updatedAt: updated.updatedAt }
          : candidate,
      );
    });
    return updated;
  }

  private viewerCanAccess(
    database: ReturnType<LocalMockStore["read"]>,
    wishlist: Wishlist,
    viewerId: EntityId,
  ): boolean {
    const room = requireRoom(database.rooms, wishlist.roomId);
    const actor = requireUser(database.users, viewerId);
    const membership = database.memberships.find(
      (candidate) =>
        candidate.roomId === room.id &&
        candidate.userId === viewerId &&
        candidate.status === "active",
    );
    const ownerMembership = database.memberships.find(
      (candidate) =>
        candidate.roomId === room.id &&
        candidate.userId === wishlist.ownerId &&
        candidate.status === "active",
    );
    return canViewWishlist({
      actor,
      grants: database.visibilityGrants,
      membership,
      ownerMembership,
      room,
      wishlist,
    });
  }
}
