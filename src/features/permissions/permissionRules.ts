import type {
  EntityId,
  Room,
  RoomMembership,
  User,
  VisibilityGrant,
  Wishlist,
  WishlistItem,
} from "@/types/domain";

interface RoomPermissionContext {
  actor: User;
  membership?: RoomMembership;
  room: Room;
}

interface WishlistPermissionContext extends RoomPermissionContext {
  grants?: VisibilityGrant[];
  ownerMembership?: RoomMembership;
  wishlist: Wishlist;
}

interface ReserveItemContext extends WishlistPermissionContext {
  item: WishlistItem;
}

function isActiveRoomMember(
  membership: RoomMembership | undefined,
  roomId: EntityId,
  userId: EntityId,
): membership is RoomMembership {
  return Boolean(
    membership &&
      membership.roomId === roomId &&
      membership.userId === userId &&
      membership.status === "active",
  );
}

export function canManageRoom({
  actor,
  membership,
  room,
}: RoomPermissionContext): boolean {
  if (!isActiveRoomMember(membership, room.id, actor.id)) {
    return false;
  }

  return membership.role === "owner" || membership.role === "admin";
}

export function canViewWishlist({
  actor,
  grants = [],
  membership,
  ownerMembership,
  room,
  wishlist,
}: WishlistPermissionContext): boolean {
  if (
    wishlist.roomId !== room.id ||
    !isActiveRoomMember(membership, room.id, actor.id) ||
    !isActiveRoomMember(ownerMembership, room.id, wishlist.ownerId)
  ) {
    return false;
  }

  if (wishlist.ownerId === actor.id || canManageRoom({ actor, membership, room })) {
    return true;
  }

  if (room.privacyMode === "public") {
    return true;
  }

  if (room.privacyMode === "private") {
    return false;
  }

  return grants.some(
    (grant) =>
      grant.roomId === room.id &&
      grant.viewerUserId === actor.id &&
      grant.wishlistOwnerId === wishlist.ownerId,
  );
}

export function canEditWishlist(
  actor: User,
  wishlist: Wishlist,
): boolean {
  return actor.id === wishlist.ownerId;
}

export function canReserveItem(context: ReserveItemContext): boolean {
  const { actor, item, wishlist } = context;

  if (
    wishlist.ownerId === actor.id ||
    item.wishlistId !== wishlist.id ||
    item.status !== "available"
  ) {
    return false;
  }

  return canViewWishlist(context);
}
