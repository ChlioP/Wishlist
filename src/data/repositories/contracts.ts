import type {
  ActivityEvent,
  EntityId,
  JoinRequest,
  Notification,
  Reservation,
  Room,
  RoomMembership,
  RoomPrivacyMode,
  RoomRole,
  User,
  VisibilityGrant,
  Wishlist,
  WishlistItem,
} from "@/types/domain";

export interface AuthRepository {
  getCurrentUser(): Promise<User | null>;
  signIn(input: { email: string; password?: string }): Promise<User>;
  register(input: {
    displayName: string;
    email: string;
    password?: string;
  }): Promise<User>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  updateProfile(
    patch: Partial<Pick<User, "displayName" | "avatarUrl">>,
  ): Promise<User>;
  subscribe(listener: (user: User | null) => void): () => void;
}

export interface RoomMember extends RoomMembership {
  user: User;
}

export interface RoomRepository {
  listForUser(userId: EntityId): Promise<Room[]>;
  getById(roomId: EntityId): Promise<Room | null>;
  create(input: {
    name: string;
    description?: string;
    ownerId: EntityId;
  }): Promise<Room>;
  update(
    roomId: EntityId,
    patch: Partial<
      Pick<Room, "name" | "description" | "privacyMode">
    >,
  ): Promise<Room>;
  joinByCode(
    userId: EntityId,
    inviteCode: string,
  ): Promise<RoomMembership>;
  leave(roomId: EntityId, userId: EntityId): Promise<void>;
  listMembers(roomId: EntityId): Promise<RoomMember[]>;
  changeRole(
    roomId: EntityId,
    userId: EntityId,
    role: RoomRole,
  ): Promise<RoomMembership>;
  removeMember(roomId: EntityId, userId: EntityId): Promise<void>;
  listJoinRequests(roomId: EntityId): Promise<JoinRequest[]>;
  reviewJoinRequest(
    requestId: EntityId,
    decision: Extract<JoinRequest["status"], "approved" | "rejected">,
  ): Promise<JoinRequest>;
  listVisibilityGrants(roomId: EntityId): Promise<VisibilityGrant[]>;
  setVisibilityGrant(input: {
    roomId: EntityId;
    viewerUserId: EntityId;
    wishlistOwnerId: EntityId;
    grantedByUserId: EntityId;
    allowed: boolean;
  }): Promise<void>;
  setPrivacyMode(
    roomId: EntityId,
    privacyMode: RoomPrivacyMode,
  ): Promise<Room>;
}

export type NewWishlistItem = Omit<
  WishlistItem,
  "id" | "wishlistId" | "createdAt" | "updatedAt"
>;

export type WishlistItemPatch = Partial<
  Omit<WishlistItem, "id" | "wishlistId" | "createdAt" | "updatedAt">
>;

export interface WishlistRepository {
  getOwn(
    roomId: EntityId,
    ownerId: EntityId,
  ): Promise<Wishlist | null>;
  getVisible(roomId: EntityId, viewerId: EntityId): Promise<Wishlist[]>;
  getById(
    wishlistId: EntityId,
    viewerId: EntityId,
  ): Promise<Wishlist | null>;
  listItems(
    wishlistId: EntityId,
    viewerId: EntityId,
  ): Promise<WishlistItem[]>;
  addItem(
    wishlistId: EntityId,
    actorId: EntityId,
    input: NewWishlistItem,
  ): Promise<WishlistItem>;
  updateItem(
    itemId: EntityId,
    actorId: EntityId,
    patch: WishlistItemPatch,
  ): Promise<WishlistItem>;
  removeItem(itemId: EntityId, actorId: EntityId): Promise<void>;
  reserveItem(
    itemId: EntityId,
    userId: EntityId,
  ): Promise<Reservation>;
  cancelReservation(
    itemId: EntityId,
    userId: EntityId,
  ): Promise<void>;
  markPurchased(
    itemId: EntityId,
    userId: EntityId,
  ): Promise<Reservation>;
}

export interface ActivityRepository {
  listForUser(userId: EntityId): Promise<ActivityEvent[]>;
  listForRoom(roomId: EntityId): Promise<ActivityEvent[]>;
  append(
    event: Omit<ActivityEvent, "id" | "createdAt">,
  ): Promise<ActivityEvent>;
}

export interface NotificationRepository {
  listForUser(userId: EntityId): Promise<Notification[]>;
  markRead(notificationId: EntityId): Promise<Notification>;
  markAllRead(userId: EntityId): Promise<void>;
  subscribe(
    userId: EntityId,
    listener: (notifications: Notification[]) => void,
  ): () => void;
}
