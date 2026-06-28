import {
  collection,
  collectionGroup,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type {
  DocumentData,
  DocumentReference,
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
  timestampToIso,
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
    const firestore = getFirebaseFirestore();
    const wishlistSnapshot = await getDoc(
      doc(firestore, "wishlists", wishlistId),
    );
    if (!wishlistSnapshot.exists()) {
      throw new RepositoryError("not_found", "Wishlist not found.");
    }
    const wishlist = mapWishlist(
      wishlistSnapshot.id,
      wishlistSnapshot.data(),
    );
    if (wishlist.ownerId !== actorId) {
      throw new RepositoryError(
        "forbidden",
        "Wishlist edit permission required.",
      );
    }
    const itemRef = doc(
      collection(firestore, "wishlists", wishlistId, "items"),
    );
    const timestamp = new Date().toISOString();
    const item: WishlistItem = {
      ...input,
      id: itemRef.id,
      wishlistId,
      name: input.name.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await setDoc(
      itemRef,
      omitUndefined({
        ...input,
        id: item.id,
        name: item.name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
    return item;
  }

  async updateItem(
    itemId: EntityId,
    actorId: EntityId,
    patch: WishlistItemPatch,
  ): Promise<WishlistItem> {
    if (patch.name !== undefined && !patch.name.trim()) {
      throw new RepositoryError("validation", "Item name cannot be empty.");
    }
    const itemRef = await this.findItemReference(itemId);
    const itemSnapshot = await getDoc(itemRef);
    const wishlistId = itemRef.parent.parent?.id;
    if (!itemSnapshot.exists() || !wishlistId) {
      throw new RepositoryError("not_found", "Wishlist item not found.");
    }
    const wishlistSnapshot = await getDoc(
      doc(getFirebaseFirestore(), "wishlists", wishlistId),
    );
    if (!wishlistSnapshot.exists()) {
      throw new RepositoryError("not_found", "Wishlist not found.");
    }
    const wishlist = mapWishlist(
      wishlistSnapshot.id,
      wishlistSnapshot.data(),
    );
    if (wishlist.ownerId !== actorId) {
      throw new RepositoryError(
        "forbidden",
        "Wishlist edit permission required.",
      );
    }
    await updateDoc(itemRef, {
      ...toFirestorePatch(patch),
      ...(patch.name === undefined ? {} : { name: patch.name.trim() }),
      updatedAt: serverTimestamp(),
    });
    return {
      ...mapWishlistItem(itemSnapshot.id, wishlistId, itemSnapshot.data()),
      ...patch,
      name:
        patch.name?.trim() ??
        mapWishlistItem(itemSnapshot.id, wishlistId, itemSnapshot.data()).name,
      updatedAt: new Date().toISOString(),
    };
  }

  async removeItem(
    itemId: EntityId,
    actorId: EntityId,
  ): Promise<void> {
    await this.updateItem(itemId, actorId, { status: "removed" });
  }

  async reserveItem(
    itemId: EntityId,
    userId: EntityId,
  ): Promise<Reservation> {
    const firestore = getFirebaseFirestore();
    const itemRef = await this.findItemReference(itemId);
    const wishlistId = itemRef.parent.parent?.id;
    if (!wishlistId) {
      throw new RepositoryError("not_found", "Wishlist item not found.");
    }
    const wishlist = await this.getById(wishlistId, userId);
    if (!wishlist || wishlist.ownerId === userId) {
      throw new RepositoryError("forbidden", "Item cannot be reserved.");
    }
    const reservationRef = doc(firestore, "reservations", itemId);
    const timestamp = new Date().toISOString();
    const reservation: Reservation = {
      id: itemId,
      roomId: wishlist.roomId,
      itemId,
      reservedByUserId: userId,
      status: "reserved",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await runTransaction(firestore, async (transaction) => {
      const [itemSnapshot, reservationSnapshot] = await Promise.all([
        transaction.get(itemRef),
        transaction.get(reservationRef),
      ]);
      if (!itemSnapshot.exists()) {
        throw new RepositoryError("not_found", "Wishlist item not found.");
      }
      const item = mapWishlistItem(
        itemSnapshot.id,
        wishlistId,
        itemSnapshot.data(),
      );
      const existingStatus = reservationSnapshot.data()?.status;
      if (
        item.status !== "available" ||
        existingStatus === "reserved" ||
        existingStatus === "purchased"
      ) {
        throw new RepositoryError("conflict", "Item is already unavailable.");
      }
      transaction.set(reservationRef, {
        roomId: wishlist.roomId,
        wishlistId,
        wishlistOwnerId: wishlist.ownerId,
        itemId,
        reservedByUserId: userId,
        status: "reserved",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      transaction.update(itemRef, {
        status: "reserved",
        updatedAt: serverTimestamp(),
      });
    });
    return reservation;
  }

  async cancelReservation(
    itemId: EntityId,
    userId: EntityId,
  ): Promise<void> {
    const firestore = getFirebaseFirestore();
    const reservationRef = doc(firestore, "reservations", itemId);
    await runTransaction(firestore, async (transaction) => {
      const reservationSnapshot = await transaction.get(reservationRef);
      if (!reservationSnapshot.exists()) {
        throw new RepositoryError("not_found", "Reservation not found.");
      }
      const data = reservationSnapshot.data();
      if (
        data.reservedByUserId !== userId ||
        data.status !== "reserved"
      ) {
        throw new RepositoryError(
          "forbidden",
          "Active reservation ownership required.",
        );
      }
      const wishlistId = String(data.wishlistId);
      const itemRef = doc(
        firestore,
        "wishlists",
        wishlistId,
        "items",
        itemId,
      );
      transaction.update(reservationRef, {
        status: "cancelled",
        updatedAt: serverTimestamp(),
      });
      transaction.update(itemRef, {
        status: "available",
        updatedAt: serverTimestamp(),
      });
    });
  }

  async markPurchased(
    itemId: EntityId,
    userId: EntityId,
  ): Promise<Reservation> {
    const firestore = getFirebaseFirestore();
    const reservationRef = doc(firestore, "reservations", itemId);
    const timestamp = new Date().toISOString();
    let roomId = "";
    let createdAt = timestamp;
    await runTransaction(firestore, async (transaction) => {
      const reservationSnapshot = await transaction.get(reservationRef);
      if (!reservationSnapshot.exists()) {
        throw new RepositoryError("not_found", "Reservation not found.");
      }
      const data = reservationSnapshot.data();
      if (
        data.reservedByUserId !== userId ||
        data.status !== "reserved"
      ) {
        throw new RepositoryError(
          "forbidden",
          "Active reservation ownership required.",
        );
      }
      roomId = String(data.roomId);
      createdAt = timestampToIso(data.createdAt);
      const itemRef = doc(
        firestore,
        "wishlists",
        String(data.wishlistId),
        "items",
        itemId,
      );
      transaction.update(reservationRef, {
        status: "purchased",
        updatedAt: serverTimestamp(),
      });
      transaction.update(itemRef, {
        status: "purchased",
        updatedAt: serverTimestamp(),
      });
    });
    return {
      id: itemId,
      roomId,
      itemId,
      reservedByUserId: userId,
      status: "purchased",
      createdAt,
      updatedAt: timestamp,
    };
  }

  private async findItemReference(
    itemId: EntityId,
  ): Promise<DocumentReference<DocumentData>> {
    const snapshots = await getDocs(
      query(
        collectionGroup(getFirebaseFirestore(), "items"),
        where("id", "==", itemId),
        limit(1),
      ),
    );
    const snapshot = snapshots.docs[0];
    if (!snapshot) {
      throw new RepositoryError("not_found", "Wishlist item not found.");
    }
    return snapshot.ref;
  }
}

function omitUndefined(
  value: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  );
}

function toFirestorePatch(
  patch: WishlistItemPatch,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(patch).map(([key, value]) => [
      key,
      value === undefined ? deleteField() : value,
    ]),
  );
}
