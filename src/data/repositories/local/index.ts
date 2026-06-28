import { LocalActivityRepository } from "@/data/repositories/local/LocalActivityRepository";
import { LocalAuthRepository } from "@/data/repositories/local/LocalAuthRepository";
import { LocalNotificationRepository } from "@/data/repositories/local/LocalNotificationRepository";
import { LocalRoomRepository } from "@/data/repositories/local/LocalRoomRepository";
import { LocalWishlistRepository } from "@/data/repositories/local/LocalWishlistRepository";
import { localMockStore } from "@/data/repositories/local/LocalMockStore";
import { MockAuthRepository } from "@/data/repositories/local/MockAuthRepository";

export const localRepositories = {
  activity: new LocalActivityRepository(localMockStore),
  auth: new LocalAuthRepository(localMockStore),
  notifications: new LocalNotificationRepository(localMockStore),
  rooms: new LocalRoomRepository(localMockStore),
  wishlists: new LocalWishlistRepository(localMockStore),
};

export {
  LocalActivityRepository,
  LocalAuthRepository,
  LocalNotificationRepository,
  LocalRoomRepository,
  LocalWishlistRepository,
  MockAuthRepository,
};
