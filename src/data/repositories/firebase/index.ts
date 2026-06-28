import { FirebaseActivityRepository } from "@/data/repositories/firebase/FirebaseActivityRepository";
import { FirebaseNotificationRepository } from "@/data/repositories/firebase/FirebaseNotificationRepository";
import { FirebaseRoomRepository } from "@/data/repositories/firebase/FirebaseRoomRepository";
import { FirebaseWishlistRepository } from "@/data/repositories/firebase/FirebaseWishlistRepository";

export function createFirebaseDataRepositories() {
  const rooms = new FirebaseRoomRepository();
  return {
    activity: new FirebaseActivityRepository(),
    notifications: new FirebaseNotificationRepository(),
    rooms,
    wishlists: new FirebaseWishlistRepository(rooms),
  };
}

export {
  FirebaseActivityRepository,
  FirebaseNotificationRepository,
  FirebaseRoomRepository,
  FirebaseWishlistRepository,
};
