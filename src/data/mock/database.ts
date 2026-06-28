import type {
  ActivityEvent,
  JoinRequest,
  Notification,
  Reservation,
  Room,
  RoomMembership,
  User,
  VisibilityGrant,
  Wishlist,
  WishlistItem,
} from "@/types/domain";

export const MOCK_SCHEMA_VERSION = 1 as const;

export interface MockDatabase {
  schemaVersion: typeof MOCK_SCHEMA_VERSION;
  currentUserId: string | null;
  users: User[];
  rooms: Room[];
  memberships: RoomMembership[];
  visibilityGrants: VisibilityGrant[];
  wishlists: Wishlist[];
  wishlistItems: WishlistItem[];
  reservations: Reservation[];
  joinRequests: JoinRequest[];
  activityEvents: ActivityEvent[];
  notifications: Notification[];
}
