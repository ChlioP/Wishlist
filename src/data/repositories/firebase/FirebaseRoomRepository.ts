import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

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
import { getFirebaseFirestore } from "@/lib/firebase";
import type {
  EntityId,
  JoinRequest,
  Room,
  RoomMembership,
  RoomPrivacyMode,
  RoomRole,
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

  async create(_input: {
    name: string;
    description?: string;
    ownerId: EntityId;
  }): Promise<Room> {
    throw readOnlyError();
  }

  async update(
    _roomId: EntityId,
    _patch: Partial<Pick<Room, "name" | "description" | "privacyMode">>,
  ): Promise<Room> {
    throw readOnlyError();
  }

  async joinByCode(
    _userId: EntityId,
    _inviteCode: string,
  ): Promise<RoomMembership> {
    throw readOnlyError();
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

  async setVisibilityGrant(_input: {
    roomId: EntityId;
    viewerUserId: EntityId;
    wishlistOwnerId: EntityId;
    grantedByUserId: EntityId;
    allowed: boolean;
  }): Promise<void> {
    throw readOnlyError();
  }

  async setPrivacyMode(
    _roomId: EntityId,
    _privacyMode: RoomPrivacyMode,
  ): Promise<Room> {
    throw readOnlyError();
  }
}
