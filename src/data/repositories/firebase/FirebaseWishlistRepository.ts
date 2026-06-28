import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";

import type {
  NewWishlistItem,
  WishlistItemPatch,
  WishlistRepository,
} from "@/data/repositories/contracts";
import { RepositoryError } from "@/data/repositories/errors";
import { FirebaseRoomRepository } from "@/data/repositories/firebase/FirebaseRoomRepository";
import {
  mapWishlist,
  mapWishlistItem,
  readOnlyError,
} from "@/data/repositories/firebase/firestoreMappers";
import { canViewWishlist } from "@/features/permissions/permissionRules";
import { getFirebaseFirestore } from "@/lib/firebase";
import type {
  EntityId,
  Reservation,
  Wishlist,
  WishlistItem,
} from "@/types/domain";

export class FirebaseWishlistRepository implements WishlistRepository {
  constructor(
    private readonly rooms: FirebaseRoomRepository =
      new FirebaseRoomRepository(),
  ) {}

  async getOwn(
    roomId: EntityId,
    ownerId: EntityId,
  ): Promise<Wishlist | null> {
    const snapshots = await getDocs(
      query(
        collection(getFirebaseFirestore(), "wishlists"),
        where("roomId", "==", roomId),
        where("ownerId", "==", ownerId),
        limit(1),
      ),
    );
    const snapshot = snapshots.docs[0];
    return snapshot ? mapWishlist(snapshot.id, snapshot.data()) : null;
  }

  async getVisible(
    roomId: EntityId,
    viewerId: EntityId,
  ): Promise<Wishlist[]> {
    const snapshots = await getDocs(
      query(
        collection(getFirebaseFirestore(), "wishlists"),
        where("roomId", "==", roomId),
      ),
    );
    const wishlists = snapshots.docs.map((snapshot) =>
      mapWishlist(snapshot.id, snapshot.data()),
    );
    const [room, members, grants] = await Promise.all([
      this.rooms.getById(roomId),
      this.rooms.listMembers(roomId),
      this.rooms.listVisibilityGrants(roomId),
    ]);
    if (!room) return [];
    const actorMembership = members.find(
      (member) => member.userId === viewerId,
    );
    if (!actorMembership) return [];
    const actor = actorMembership.user;
    return wishlists.filter((wishlist) =>
      canViewWishlist({
        actor,
        grants,
        membership: actorMembership,
        ownerMembership: members.find(
          (member) => member.userId === wishlist.ownerId,
        ),
        room,
        wishlist,
      }),
    );
  }

  async getById(
    wishlistId: EntityId,
    viewerId: EntityId,
  ): Promise<Wishlist | null> {
    const snapshot = await getDoc(
      doc(getFirebaseFirestore(), "wishlists", wishlistId),
    );
    if (!snapshot.exists()) return null;
    const wishlist = mapWishlist(snapshot.id, snapshot.data());
    const visible = await this.getVisible(wishlist.roomId, viewerId);
    return visible.some((candidate) => candidate.id === wishlistId)
      ? wishlist
      : null;
  }

  async listItems(
    wishlistId: EntityId,
    viewerId: EntityId,
  ): Promise<WishlistItem[]> {
    const wishlist = await this.getById(wishlistId, viewerId);
    if (!wishlist) {
      throw new RepositoryError("forbidden", "Wishlist access denied.");
    }
    const snapshots = await getDocs(
      collection(
        getFirebaseFirestore(),
        "wishlists",
        wishlistId,
        "items",
      ),
    );
    return snapshots.docs
      .map((snapshot) =>
        mapWishlistItem(snapshot.id, wishlistId, snapshot.data()),
      )
      .filter((item) => item.status !== "removed");
  }

  async addItem(
    _wishlistId: EntityId,
    _actorId: EntityId,
    _input: NewWishlistItem,
  ): Promise<WishlistItem> {
    throw readOnlyError();
  }

  async updateItem(
    _itemId: EntityId,
    _actorId: EntityId,
    _patch: WishlistItemPatch,
  ): Promise<WishlistItem> {
    throw readOnlyError();
  }

  async removeItem(
    _itemId: EntityId,
    _actorId: EntityId,
  ): Promise<void> {
    throw readOnlyError();
  }

  async reserveItem(
    _itemId: EntityId,
    _userId: EntityId,
  ): Promise<Reservation> {
    throw readOnlyError();
  }

  async cancelReservation(
    _itemId: EntityId,
    _userId: EntityId,
  ): Promise<void> {
    throw readOnlyError();
  }

  async markPurchased(
    _itemId: EntityId,
    _userId: EntityId,
  ): Promise<Reservation> {
    throw readOnlyError();
  }
}
