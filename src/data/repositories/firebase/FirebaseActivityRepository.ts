import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import type { ActivityRepository } from "@/data/repositories/contracts";
import {
  mapActivity,
  readOnlyError,
} from "@/data/repositories/firebase/firestoreMappers";
import { getFirebaseFirestore } from "@/lib/firebase";
import type { ActivityEvent, EntityId } from "@/types/domain";

export class FirebaseActivityRepository implements ActivityRepository {
  async listForUser(userId: EntityId): Promise<ActivityEvent[]> {
    const snapshots = await getDocs(
      query(
        collection(getFirebaseFirestore(), "activity"),
        where("actorUserId", "==", userId),
        orderBy("createdAt", "desc"),
      ),
    );
    return snapshots.docs.map(mapActivity);
  }

  async listForRoom(roomId: EntityId): Promise<ActivityEvent[]> {
    const snapshots = await getDocs(
      query(
        collection(getFirebaseFirestore(), "activity"),
        where("roomId", "==", roomId),
        orderBy("createdAt", "desc"),
      ),
    );
    return snapshots.docs.map(mapActivity);
  }

  async append(
    _event: Omit<ActivityEvent, "id" | "createdAt">,
  ): Promise<ActivityEvent> {
    throw readOnlyError();
  }
}
