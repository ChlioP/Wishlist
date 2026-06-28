export type EntityId = string;
export type ISODateString = string;

export interface UserPreferences {
  emailNotifications: boolean;
  joinRequestNotifications: boolean;
  roomActivityNotifications: boolean;
  showEmailToRoomMembers: boolean;
  wishlistUpdateNotifications: boolean;
}

export interface User {
  id: EntityId;
  displayName: string;
  email: string;
  avatarUrl?: string;
  preferences: UserPreferences;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type RoomRole = "owner" | "admin" | "member";
export type RoomPrivacyMode = "private" | "shared" | "public";
export type MembershipStatus = "pending" | "active" | "removed";

export interface Room {
  id: EntityId;
  name: string;
  description?: string;
  inviteCode: string;
  privacyMode: RoomPrivacyMode;
  ownerId: EntityId;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface RoomMembership {
  id: EntityId;
  roomId: EntityId;
  userId: EntityId;
  role: RoomRole;
  status: MembershipStatus;
  joinedAt: ISODateString;
}

export interface VisibilityGrant {
  id: EntityId;
  roomId: EntityId;
  viewerUserId: EntityId;
  wishlistOwnerId: EntityId;
  grantedByUserId: EntityId;
  createdAt: ISODateString;
}

export interface Wishlist {
  id: EntityId;
  roomId: EntityId;
  ownerId: EntityId;
  title: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type WishlistItemStatus =
  | "available"
  | "reserved"
  | "purchased"
  | "removed"
  | "out_of_stock";

export type WishlistItemPriority = "low" | "medium" | "high";

export interface WishlistItem {
  id: EntityId;
  wishlistId: EntityId;
  name: string;
  description?: string;
  category?: string;
  priority: WishlistItemPriority;
  estimatedPriceCents?: number;
  currency?: string;
  productUrl?: string;
  imageUrl?: string;
  quantityDesired: number;
  notes?: string;
  status: WishlistItemStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type ReservationStatus = "reserved" | "purchased" | "cancelled";

export interface Reservation {
  id: EntityId;
  roomId: EntityId;
  itemId: EntityId;
  reservedByUserId: EntityId;
  status: ReservationStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type ActivityAction =
  | "room_created"
  | "room_joined"
  | "room_updated"
  | "member_added"
  | "member_removed"
  | "role_changed"
  | "visibility_changed"
  | "item_added"
  | "item_updated"
  | "item_removed"
  | "item_reserved"
  | "item_purchased";

export type ActivityMetadataValue = string | number | boolean | null;

export interface ActivityEvent {
  id: EntityId;
  actorUserId: EntityId;
  roomId?: EntityId;
  wishlistId?: EntityId;
  itemId?: EntityId;
  action: ActivityAction;
  metadata: Record<string, ActivityMetadataValue>;
  createdAt: ISODateString;
}

export type NotificationType =
  | "room_invitation"
  | "join_request"
  | "member_joined"
  | "visibility_changed"
  | "item_reserved"
  | "item_purchased";

export interface Notification {
  id: EntityId;
  recipientUserId: EntityId;
  type: NotificationType;
  roomId?: EntityId;
  actorUserId?: EntityId;
  metadata: Record<string, ActivityMetadataValue>;
  readAt?: ISODateString;
  createdAt: ISODateString;
}

export type JoinRequestStatus = "pending" | "approved" | "rejected";

export interface JoinRequest {
  id: EntityId;
  roomId: EntityId;
  userId: EntityId;
  status: JoinRequestStatus;
  reviewedByUserId?: EntityId;
  createdAt: ISODateString;
  reviewedAt?: ISODateString;
}
