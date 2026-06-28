import { RepositoryError } from "@/data/repositories/errors";
import type {
  EntityId,
  Room,
  RoomMembership,
  User,
  Wishlist,
  WishlistItem,
} from "@/types/domain";

export function createId(prefix: string): EntityId {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${randomId}`;
}

export function now(): string {
  return new Date().toISOString();
}

export function requireUser(
  users: User[],
  userId: EntityId,
): User {
  const user = users.find((candidate) => candidate.id === userId);
  if (!user) {
    throw new RepositoryError("not_found", "User not found.");
  }
  return user;
}

export function requireRoom(
  rooms: Room[],
  roomId: EntityId,
): Room {
  const room = rooms.find((candidate) => candidate.id === roomId);
  if (!room) {
    throw new RepositoryError("not_found", "Room not found.");
  }
  return room;
}

export function requireMembership(
  memberships: RoomMembership[],
  roomId: EntityId,
  userId: EntityId,
): RoomMembership {
  const membership = memberships.find(
    (candidate) =>
      candidate.roomId === roomId &&
      candidate.userId === userId &&
      candidate.status === "active",
  );
  if (!membership) {
    throw new RepositoryError("forbidden", "Active room membership required.");
  }
  return membership;
}

export function requireWishlist(
  wishlists: Wishlist[],
  wishlistId: EntityId,
): Wishlist {
  const wishlist = wishlists.find(
    (candidate) => candidate.id === wishlistId,
  );
  if (!wishlist) {
    throw new RepositoryError("not_found", "Wishlist not found.");
  }
  return wishlist;
}

export function requireWishlistItem(
  items: WishlistItem[],
  itemId: EntityId,
): WishlistItem {
  const item = items.find((candidate) => candidate.id === itemId);
  if (!item) {
    throw new RepositoryError("not_found", "Wishlist item not found.");
  }
  return item;
}
