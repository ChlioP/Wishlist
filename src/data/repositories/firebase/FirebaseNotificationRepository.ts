import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import type { NotificationRepository } from "@/data/repositories/contracts";
import {
  mapNotification,
  readOnlyError,
} from "@/data/repositories/firebase/firestoreMappers";
import { getFirebaseFirestore } from "@/lib/firebase";
import type { EntityId, Notification } from "@/types/domain";

export class FirebaseNotificationRepository
  implements NotificationRepository
{
  async listForUser(userId: EntityId): Promise<Notification[]> {
    const snapshots = await getDocs(this.userQuery(userId));
    return snapshots.docs.map(mapNotification);
  }

  subscribe(
    userId: EntityId,
    listener: (notifications: Notification[]) => void,
  ): () => void {
    return onSnapshot(
      this.userQuery(userId),
      (snapshots) => listener(snapshots.docs.map(mapNotification)),
      () => {
        // Read failures are surfaced by listForUser during page initialization.
      },
    );
  }

  async markRead(_notificationId: EntityId): Promise<Notification> {
    throw readOnlyError();
  }

  async markAllRead(_userId: EntityId): Promise<void> {
    throw readOnlyError();
  }

  private userQuery(userId: EntityId) {
    return query(
      collection(getFirebaseFirestore(), "notifications"),
      where("recipientUserId", "==", userId),
      orderBy("createdAt", "desc"),
    );
  }
}
