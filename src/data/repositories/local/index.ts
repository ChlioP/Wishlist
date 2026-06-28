import type {
  ActivityRepository,
  NotificationRepository,
  RoomRepository,
  WishlistRepository,
} from "@/data/repositories/contracts";
import { LocalActivityRepository } from "@/data/repositories/local/LocalActivityRepository";
import { LocalAuthRepository } from "@/data/repositories/local/LocalAuthRepository";
import { LocalNotificationRepository } from "@/data/repositories/local/LocalNotificationRepository";
import { LocalRoomRepository } from "@/data/repositories/local/LocalRoomRepository";
import { LocalWishlistRepository } from "@/data/repositories/local/LocalWishlistRepository";
import { localMockStore } from "@/data/repositories/local/LocalMockStore";
import { MockAuthRepository } from "@/data/repositories/local/MockAuthRepository";
import { dataProvider } from "@/lib/firebaseConfig";

interface DataRepositories {
  activity: ActivityRepository;
  notifications: NotificationRepository;
  rooms: RoomRepository;
  wishlists: WishlistRepository;
}

export const mockRepositories = {
  activity: new LocalActivityRepository(localMockStore),
  auth: new MockAuthRepository(localMockStore),
  notifications: new LocalNotificationRepository(localMockStore),
  rooms: new LocalRoomRepository(localMockStore),
  wishlists: new LocalWishlistRepository(localMockStore),
};

let selectedDataRepositories: Promise<DataRepositories> | null = null;

function getSelectedDataRepositories(): Promise<DataRepositories> {
  if (selectedDataRepositories) return selectedDataRepositories;
  selectedDataRepositories =
    dataProvider === "firebase"
      ? import("@/data/repositories/firebase").then(
          ({ createFirebaseDataRepositories }) =>
            createFirebaseDataRepositories(),
        )
      : Promise.resolve(mockRepositories);
  return selectedDataRepositories;
}

function createLazyAsyncRepository<
  Key extends "activity" | "rooms" | "wishlists",
>(key: Key): DataRepositories[Key] {
  return new Proxy(
    {},
    {
      get(_target, property) {
        return (...args: unknown[]) =>
          getSelectedDataRepositories().then((repositories) => {
            const repository = repositories[key] as unknown as Record<
              PropertyKey,
              (...methodArgs: unknown[]) => unknown
            >;
            return repository[property](...args);
          });
      },
    },
  ) as DataRepositories[Key];
}

const selectedNotifications: NotificationRepository = {
  async listForUser(userId) {
    return (await getSelectedDataRepositories()).notifications.listForUser(
      userId,
    );
  },
  async markRead(notificationId) {
    return (await getSelectedDataRepositories()).notifications.markRead(
      notificationId,
    );
  },
  async markAllRead(userId) {
    return (await getSelectedDataRepositories()).notifications.markAllRead(
      userId,
    );
  },
  subscribe(userId, listener) {
    let active = true;
    let unsubscribe = () => {};
    void getSelectedDataRepositories()
      .then((repositories) => {
        if (active) {
          unsubscribe = repositories.notifications.subscribe(userId, listener);
        }
      })
      .catch(() => {
        // listForUser surfaces initialization and read failures to the page.
      });
    return () => {
      active = false;
      unsubscribe();
    };
  },
};

/**
 * Backwards-compatible export used by current pages. Data repositories are
 * selected by VITE_DATA_PROVIDER; auth is selected separately by authRepository.
 */
export const localRepositories = {
  activity: createLazyAsyncRepository("activity"),
  auth: mockRepositories.auth,
  notifications: selectedNotifications,
  rooms: createLazyAsyncRepository("rooms"),
  wishlists: createLazyAsyncRepository("wishlists"),
};

export {
  LocalActivityRepository,
  LocalAuthRepository,
  LocalNotificationRepository,
  LocalRoomRepository,
  LocalWishlistRepository,
  MockAuthRepository,
};
