import {
  collection,
  collectionGroup,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type { DocumentReference } from "firebase/firestore";
import { FirebaseError } from "firebase/app";

import type {
  RoomMember,
  RoomRepository,
} from "@/data/repositories/contracts";
import {
  mapJoinRequest,
  mapMembership,
  mapProfile,
  mapRoom,
  mapVisibilityGrant,
  readOnlyError,
} from "@/data/repositories/firebase/firestoreMappers";
import { RepositoryError } from "@/data/repositories/errors";
import { defaultUserPreferences } from "@/features/auth/defaultPreferences";
import { canManageRoom } from "@/features/permissions/permissionRules";
import {
  getFirebaseAuth,
  getFirebaseFirestore,
} from "@/lib/firebase";
import type {
  EntityId,
  JoinRequest,
  Room,
  RoomMembership,
  RoomPrivacyMode,
  RoomRole,
  User,
  VisibilityGrant,
} from "@/types/domain";

export class FirebaseRoomRepository implements RoomRepository {
  async listForUser(userId: EntityId): Promise<Room[]> {
    const firestore = getFirebaseFirestore();
    const memberships = await getDocs(
      query(
        collectionGroup(firestore, "members"),
        where("userId", "==", userId),
        where("status", "==", "active"),
      ),
    );
    const roomIds = Array.from(
      new Set(
        memberships.docs
          .map((snapshot) => snapshot.ref.parent.parent?.id)
          .filter((roomId): roomId is string => Boolean(roomId)),
      ),
    );
    const rooms = await Promise.all(
      roomIds.map((roomId) => this.getById(roomId)),
    );
    return rooms.filter((room): room is Room => room !== null);
  }

  async getById(roomId: EntityId): Promise<Room | null> {
    const snapshot = await getDoc(
      doc(getFirebaseFirestore(), "rooms", roomId),
    );
    return snapshot.exists() ? mapRoom(snapshot.id, snapshot.data()) : null;
  }

  async listMembers(roomId: EntityId): Promise<RoomMember[]> {
    const firestore = getFirebaseFirestore();
    const memberSnapshots = await getDocs(
      query(
        collection(firestore, "rooms", roomId, "members"),
        where("status", "==", "active"),
      ),
    );
    return Promise.all(
      memberSnapshots.docs.map(async (snapshot) => {
        const membership = mapMembership(
          snapshot.id,
          roomId,
          snapshot.data(),
        );
        const profileSnapshot = await getDoc(
          doc(firestore, "profiles", membership.userId),
        );
        const user = profileSnapshot.exists()
          ? mapProfile(profileSnapshot.id, profileSnapshot.data())
          : mapProfile(membership.userId, {});
        return { ...membership, user };
      }),
    );
  }

  async listJoinRequests(roomId: EntityId): Promise<JoinRequest[]> {
    const snapshots = await getDocs(
      collection(
        getFirebaseFirestore(),
        "rooms",
        roomId,
        "joinRequests",
      ),
    );
    return snapshots.docs.map((snapshot) =>
      mapJoinRequest(snapshot.id, roomId, snapshot.data()),
    );
  }

  async listVisibilityGrants(
    roomId: EntityId,
  ): Promise<VisibilityGrant[]> {
    const snapshots = await getDocs(
      collection(
        getFirebaseFirestore(),
        "rooms",
        roomId,
        "visibilityGrants",
      ),
    );
    return snapshots.docs.map((snapshot) =>
      mapVisibilityGrant(snapshot.id, roomId, snapshot.data()),
    );
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
    const firestore = getFirebaseFirestore();
    const roomRef = doc(collection(firestore, "rooms"));
    const membershipRef = doc(
      firestore,
      "rooms",
      roomRef.id,
      "members",
      input.ownerId,
    );
    const wishlistRef = doc(
      firestore,
      "wishlists",
      `${roomRef.id}_${input.ownerId}`,
    );
    const inviteCode = createInviteCode(name);
    const timestamp = new Date().toISOString();
    const room: Room = {
      id: roomRef.id,
      name,
      description: input.description?.trim() || undefined,
      inviteCode,
      privacyMode: "private",
      ownerId: input.ownerId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const batch = writeBatch(firestore);
    batch.set(roomRef, {
      name,
      ...(room.description ? { description: room.description } : {}),
      inviteCode,
      privacyMode: "private",
      ownerId: input.ownerId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.set(membershipRef, {
      userId: input.ownerId,
      role: "owner",
      status: "active",
      joinedAt: serverTimestamp(),
    });
    batch.set(wishlistRef, {
      roomId: roomRef.id,
      ownerId: input.ownerId,
      title: `${name} Wishlist`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
    return room;
  }

  async update(
    roomId: EntityId,
    patch: Partial<Pick<Room, "name" | "description" | "privacyMode">>,
  ): Promise<Room> {
    const room = await this.getById(roomId);
    if (!room) {
      throw new RepositoryError("not_found", "Room not found.");
    }
    if (patch.name !== undefined && !patch.name.trim()) {
      throw new RepositoryError("validation", "Room name cannot be empty.");
    }
    await this.assertCurrentUserCanManage(room);
    try {
      await updateDoc(doc(getFirebaseFirestore(), "rooms", roomId), {
        ...Object.fromEntries(
          Object.entries(patch).map(([key, value]) => [
            key,
            value === undefined
              ? deleteField()
              : key === "name" && typeof value === "string"
                ? value.trim()
                : value,
          ]),
        ),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw translateRoomWriteError(error);
    }
    return {
      ...room,
      ...patch,
      name: patch.name?.trim() ?? room.name,
      updatedAt: new Date().toISOString(),
    };
  }

  async deleteRoom(roomId: EntityId): Promise<void> {
    const firestore = getFirebaseFirestore();
    const room = await this.getById(roomId);
    if (!room) {
      throw new RepositoryError("not_found", "Room not found.");
    }
    await this.assertCurrentUserCanManage(room);

    try {
      const [
        memberships,
        grants,
        joinRequests,
        wishlists,
        reservations,
      ] = await Promise.all([
        getDocs(collection(firestore, "rooms", roomId, "members")),
        getDocs(
          collection(firestore, "rooms", roomId, "visibilityGrants"),
        ),
        getDocs(collection(firestore, "rooms", roomId, "joinRequests")),
        getDocs(
          query(
            collection(firestore, "wishlists"),
            where("roomId", "==", roomId),
          ),
        ),
        getDocs(
          query(
            collection(firestore, "reservations"),
            where("roomId", "==", roomId),
          ),
        ),
      ]);
      const itemSnapshots = await Promise.all(
        wishlists.docs.map((wishlist) =>
          getDocs(collection(wishlist.ref, "items")),
        ),
      );
      const references: DocumentReference[] = [
        ...memberships.docs.map((snapshot) => snapshot.ref),
        ...grants.docs.map((snapshot) => snapshot.ref),
        ...joinRequests.docs.map((snapshot) => snapshot.ref),
        ...itemSnapshots.flatMap((items) =>
          items.docs.map((snapshot) => snapshot.ref),
        ),
        ...wishlists.docs.map((snapshot) => snapshot.ref),
        ...reservations.docs.map((snapshot) => snapshot.ref),
        doc(firestore, "rooms", roomId),
      ];
      await deleteInBatches(references);
    } catch (error) {
      throw translateRoomWriteError(error);
    }
  }

  async joinByCode(
    userId: EntityId,
    inviteCode: string,
  ): Promise<RoomMembership> {
    const code = inviteCode.trim().toUpperCase();
    if (!code) {
      throw new RepositoryError("validation", "Invite code is required.");
    }
    const firestore = getFirebaseFirestore();
    const rooms = await getDocs(
      query(
        collection(firestore, "rooms"),
        where("inviteCode", "==", code),
        limit(1),
      ),
    );
    const roomSnapshot = rooms.docs[0];
    if (!roomSnapshot) {
      throw new RepositoryError("not_found", "Room code was not found.");
    }
    const membershipRef = doc(
      firestore,
      "rooms",
      roomSnapshot.id,
      "members",
      userId,
    );
    const existing = await getDoc(membershipRef);
    if (existing.exists() && existing.data().status === "active") {
      throw new RepositoryError("conflict", "User already belongs to room.");
    }
    const wishlistRef = doc(
      firestore,
      "wishlists",
      `${roomSnapshot.id}_${userId}`,
    );
    const wishlistSnapshot = await getDoc(wishlistRef);
    const batch = writeBatch(firestore);
    batch.set(
      membershipRef,
      {
        userId,
        role: "member",
        status: "active",
        joinedAt: serverTimestamp(),
      },
      { merge: true },
    );
    if (!wishlistSnapshot.exists()) {
      batch.set(wishlistRef, {
        roomId: roomSnapshot.id,
        ownerId: userId,
        title: `${String(roomSnapshot.data().name ?? "Room")} Wishlist`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
    return {
      id: userId,
      roomId: roomSnapshot.id,
      userId,
      role: "member",
      status: "active",
      joinedAt: new Date().toISOString(),
    };
  }

  async leave(_roomId: EntityId, _userId: EntityId): Promise<void> {
    throw readOnlyError();
  }

  async changeRole(
    _roomId: EntityId,
    _userId: EntityId,
    _role: RoomRole,
  ): Promise<RoomMembership> {
    throw readOnlyError();
  }

  async removeMember(
    _roomId: EntityId,
    _userId: EntityId,
  ): Promise<void> {
    throw readOnlyError();
  }

  async reviewJoinRequest(
    _requestId: EntityId,
    _decision: "approved" | "rejected",
  ): Promise<JoinRequest> {
    throw readOnlyError();
  }

  async setVisibilityGrant(input: {
    roomId: EntityId;
    viewerUserId: EntityId;
    wishlistOwnerId: EntityId;
    grantedByUserId: EntityId;
    allowed: boolean;
  }): Promise<void> {
    if (input.viewerUserId === input.wishlistOwnerId) {
      throw new RepositoryError(
        "validation",
        "A visibility grant cannot target the same user.",
      );
    }
    const room = await this.getById(input.roomId);
    if (!room) {
      throw new RepositoryError("not_found", "Room not found.");
    }
    const actorId = await this.assertCurrentUserCanManage(room);
    if (actorId !== input.grantedByUserId) {
      throw new RepositoryError(
        "forbidden",
        "Visibility changes must be attributed to the signed-in user.",
      );
    }
    const members = await this.listMembers(input.roomId);
    const administrator = members.find(
      (member) => member.userId === input.grantedByUserId,
    );
    if (
      !administrator ||
      (administrator.role !== "owner" && administrator.role !== "admin")
    ) {
      throw new RepositoryError(
        "forbidden",
        "Room management permission required.",
      );
    }
    if (
      !members.some((member) => member.userId === input.viewerUserId) ||
      !members.some((member) => member.userId === input.wishlistOwnerId)
    ) {
      throw new RepositoryError(
        "validation",
        "Visibility users must be active room members.",
      );
    }
    const grantRef = doc(
      getFirebaseFirestore(),
      "rooms",
      input.roomId,
      "visibilityGrants",
      `${input.viewerUserId}_${input.wishlistOwnerId}`,
    );
    try {
      if (!input.allowed) {
        await deleteDoc(grantRef);
        return;
      }
      await setDoc(grantRef, {
        viewerUserId: input.viewerUserId,
        wishlistOwnerId: input.wishlistOwnerId,
        grantedByUserId: input.grantedByUserId,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      throw translateRoomWriteError(error);
    }
  }

  async setPrivacyMode(
    roomId: EntityId,
    privacyMode: RoomPrivacyMode,
  ): Promise<Room> {
    return this.update(roomId, { privacyMode });
  }

  private async assertCurrentUserCanManage(room: Room): Promise<string> {
    const firebaseUser = getFirebaseAuth().currentUser;
    if (!firebaseUser) {
      throw new RepositoryError("unauthenticated", "Sign in is required.");
    }
    const membershipSnapshot = await getDoc(
      doc(
        getFirebaseFirestore(),
        "rooms",
        room.id,
        "members",
        firebaseUser.uid,
      ),
    );
    if (!membershipSnapshot.exists()) {
      throw new RepositoryError(
        "forbidden",
        "You are not a member of this room.",
      );
    }
    const membership = mapMembership(
      membershipSnapshot.id,
      room.id,
      membershipSnapshot.data(),
    );
    const timestamp = new Date().toISOString();
    const actor: User = {
      id: firebaseUser.uid,
      displayName:
        firebaseUser.displayName ?? firebaseUser.email ?? "Room member",
      email: firebaseUser.email ?? "",
      avatarUrl: firebaseUser.photoURL ?? undefined,
      preferences: defaultUserPreferences,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    if (!canManageRoom({ actor, membership, room })) {
      throw new RepositoryError(
        "forbidden",
        "Owner or administrator permission is required.",
      );
    }
    return firebaseUser.uid;
  }
}

async function deleteInBatches(
  references: DocumentReference[],
): Promise<void> {
  const firestore = getFirebaseFirestore();
  const batchSize = 400;
  for (let index = 0; index < references.length; index += batchSize) {
    const batch = writeBatch(firestore);
    references
      .slice(index, index + batchSize)
      .forEach((reference) => batch.delete(reference));
    await batch.commit();
  }
}

function translateRoomWriteError(error: unknown): RepositoryError {
  if (error instanceof RepositoryError) return error;
  if (error instanceof FirebaseError) {
    if (error.code === "permission-denied") {
      return new RepositoryError(
        "forbidden",
        "Firestore denied this change. Owner or administrator permission is required.",
      );
    }
    if (error.code === "not-found") {
      return new RepositoryError("not_found", "Room not found.");
    }
  }
  return new RepositoryError(
    "validation",
    "The room change could not be completed.",
  );
}

function createInviteCode(name: string): string {
  const prefix =
    name
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 12) || "ROOM";
  const random = crypto
    .getRandomValues(new Uint32Array(1))[0]
    .toString(36)
    .toUpperCase()
    .slice(0, 6)
    .padStart(6, "0");
  return `${prefix}-${random}`;
}
