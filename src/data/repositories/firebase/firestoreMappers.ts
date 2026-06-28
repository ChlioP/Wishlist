import { Timestamp } from "firebase/firestore";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

import { RepositoryError } from "@/data/repositories/errors";
import { defaultUserPreferences } from "@/features/auth/defaultPreferences";
import type {
  ActivityEvent,
  JoinRequest,
  Notification,
  Room,
  RoomMembership,
  User,
  VisibilityGrant,
  Wishlist,
  WishlistItem,
} from "@/types/domain";

export function readOnlyError(): RepositoryError {
  return new RepositoryError(
    "forbidden",
    "Firestore mutations are not enabled in this phase.",
  );
}

export function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toISOString();
  }
  return new Date(0).toISOString();
}

export function mapRoom(id: string, data: DocumentData): Room {
  return {
    id,
    name: requiredString(data.name, "Room name"),
    description: optionalString(data.description),
    inviteCode: optionalString(data.inviteCode) ?? "",
    privacyMode:
      data.privacyMode === "private" ||
      data.privacyMode === "shared" ||
      data.privacyMode === "public"
        ? data.privacyMode
        : "private",
    ownerId: requiredString(data.ownerId, "Room owner"),
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  };
}

export function mapMembership(
  id: string,
  roomId: string,
  data: DocumentData,
): RoomMembership {
  return {
    id,
    roomId,
    userId: optionalString(data.userId) ?? id,
    role:
      data.role === "owner" || data.role === "admin"
        ? data.role
        : "member",
    status:
      data.status === "pending" || data.status === "removed"
        ? data.status
        : "active",
    joinedAt: timestampToIso(data.joinedAt),
  };
}

export function mapProfile(id: string, data: DocumentData): User {
  const createdAt = timestampToIso(data.createdAt);
  return {
    id,
    displayName:
      optionalString(data.displayName) ?? `Member ${id.slice(0, 6)}`,
    email:
      optionalString(data.publicEmail) ?? optionalString(data.email) ?? "",
    avatarUrl: optionalString(data.avatarUrl),
    preferences: {
      ...defaultUserPreferences,
      showEmailToRoomMembers: Boolean(data.publicEmail),
    },
    createdAt,
    updatedAt: timestampToIso(data.updatedAt),
  };
}

export function mapVisibilityGrant(
  id: string,
  roomId: string,
  data: DocumentData,
): VisibilityGrant {
  return {
    id,
    roomId,
    viewerUserId: requiredString(data.viewerUserId, "Grant viewer"),
    wishlistOwnerId: requiredString(
      data.wishlistOwnerId,
      "Grant wishlist owner",
    ),
    grantedByUserId: requiredString(
      data.grantedByUserId,
      "Grant administrator",
    ),
    createdAt: timestampToIso(data.createdAt),
  };
}

export function mapJoinRequest(
  id: string,
  roomId: string,
  data: DocumentData,
): JoinRequest {
  return {
    id,
    roomId,
    userId: requiredString(data.userId, "Join-request user"),
    status:
      data.status === "approved" || data.status === "rejected"
        ? data.status
        : "pending",
    reviewedByUserId: optionalString(data.reviewedByUserId),
    createdAt: timestampToIso(data.createdAt),
    reviewedAt: data.reviewedAt
      ? timestampToIso(data.reviewedAt)
      : undefined,
  };
}

export function mapWishlist(id: string, data: DocumentData): Wishlist {
  return {
    id,
    roomId: requiredString(data.roomId, "Wishlist room"),
    ownerId: requiredString(data.ownerId, "Wishlist owner"),
    title: optionalString(data.title) ?? "Wishlist",
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  };
}

export function mapWishlistItem(
  id: string,
  wishlistId: string,
  data: DocumentData,
): WishlistItem {
  return {
    id,
    wishlistId,
    name: requiredString(data.name, "Wishlist item name"),
    description: optionalString(data.description),
    category: optionalString(data.category),
    priority:
      data.priority === "low" || data.priority === "high"
        ? data.priority
        : "medium",
    estimatedPriceCents:
      typeof data.estimatedPriceCents === "number"
        ? data.estimatedPriceCents
        : undefined,
    currency: optionalString(data.currency),
    productUrl: optionalString(data.productUrl),
    imageUrl: optionalString(data.imageUrl),
    quantityDesired:
      typeof data.quantityDesired === "number" ? data.quantityDesired : 1,
    notes: optionalString(data.notes),
    status:
      data.status === "reserved" ||
      data.status === "purchased" ||
      data.status === "removed" ||
      data.status === "out_of_stock"
        ? data.status
        : "available",
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  };
}

export function mapNotification(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): Notification {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    recipientUserId: requiredString(
      data.recipientUserId,
      "Notification recipient",
    ),
    type: data.type as Notification["type"],
    roomId: optionalString(data.roomId),
    actorUserId: optionalString(data.actorUserId),
    metadata: isMetadata(data.metadata) ? data.metadata : {},
    readAt: data.readAt ? timestampToIso(data.readAt) : undefined,
    createdAt: timestampToIso(data.createdAt),
  };
}

export function mapActivity(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): ActivityEvent {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    actorUserId: requiredString(data.actorUserId, "Activity actor"),
    roomId: optionalString(data.roomId),
    wishlistId: optionalString(data.wishlistId),
    itemId: optionalString(data.itemId),
    action: data.action as ActivityEvent["action"],
    metadata: isMetadata(data.metadata) ? data.metadata : {},
    createdAt: timestampToIso(data.createdAt),
  };
}

function requiredString(value: unknown, label: string): string {
  if (typeof value === "string" && value.length > 0) return value;
  throw new RepositoryError("validation", `${label} is missing.`);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function isMetadata(
  value: unknown,
): value is Record<string, string | number | boolean | null> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every(
    (entry) =>
      entry === null ||
      typeof entry === "string" ||
      typeof entry === "number" ||
      typeof entry === "boolean",
  );
}
