import { beforeEach, describe, expect, it } from "vitest";

import { fixtureIds } from "@/data/mock/fixtures";
import { createSeedDatabase } from "@/data/mock/localStorage";
import { LocalAuthRepository } from "@/data/repositories/local/LocalAuthRepository";
import { LocalMockStore } from "@/data/repositories/local/LocalMockStore";
import { LocalRoomRepository } from "@/data/repositories/local/LocalRoomRepository";
import { LocalWishlistRepository } from "@/data/repositories/local/LocalWishlistRepository";

describe("local repositories", () => {
  let store: LocalMockStore;
  let authRepository: LocalAuthRepository;
  let roomRepository: LocalRoomRepository;
  let wishlistRepository: LocalWishlistRepository;

  beforeEach(() => {
    store = new LocalMockStore(createSeedDatabase());
    authRepository = new LocalAuthRepository(store);
    roomRepository = new LocalRoomRepository(store);
    wishlistRepository = new LocalWishlistRepository(store);
  });

  it("persists authentication state through the repository", async () => {
    const signedIn = await authRepository.signIn({
      email: "bob@example.com",
    });
    expect(signedIn.id).toBe(fixtureIds.users.member);
    expect((await authRepository.getCurrentUser())?.id).toBe(
      fixtureIds.users.member,
    );

    await authRepository.signOut();
    expect(await authRepository.getCurrentUser()).toBeNull();
  });

  it("adds, edits, and soft-deletes wishlist items", async () => {
    const item = await wishlistRepository.addItem(
      fixtureIds.wishlists.adminShared,
      fixtureIds.users.admin,
      {
        currency: "USD",
        name: "  Test item  ",
        priority: "high",
        quantityDesired: 1,
        status: "available",
      },
    );
    expect(item.name).toBe("Test item");

    const updated = await wishlistRepository.updateItem(
      item.id,
      fixtureIds.users.admin,
      { name: "Updated item", quantityDesired: 2 },
    );
    expect(updated).toMatchObject({
      name: "Updated item",
      quantityDesired: 2,
    });

    await wishlistRepository.removeItem(item.id, fixtureIds.users.admin);
    const visibleItems = await wishlistRepository.listItems(
      fixtureIds.wishlists.adminShared,
      fixtureIds.users.admin,
    );
    expect(visibleItems).not.toContainEqual(
      expect.objectContaining({ id: item.id }),
    );
    expect(
      store.read().wishlistItems.find((candidate) => candidate.id === item.id)
        ?.status,
    ).toBe("removed");
  });

  it("rejects wishlist edits from a non-owner", async () => {
    await expect(
      wishlistRepository.addItem(
        fixtureIds.wishlists.adminShared,
        fixtureIds.users.member,
        {
          name: "Unauthorized item",
          priority: "medium",
          quantityDesired: 1,
          status: "available",
        },
      ),
    ).rejects.toMatchObject({ code: "forbidden" });
  });

  it("updates room privacy for the signed-in owner", async () => {
    const updated = await roomRepository.setPrivacyMode(
      fixtureIds.rooms.shared,
      "public",
    );

    expect(updated.privacyMode).toBe("public");
    expect(
      (await roomRepository.getById(fixtureIds.rooms.shared))?.privacyMode,
    ).toBe("public");
  });

  it("rejects room privacy changes from a regular member", async () => {
    store.mutate((database) => {
      database.currentUserId = fixtureIds.users.sharedMember;
    });

    await expect(
      roomRepository.setPrivacyMode(fixtureIds.rooms.shared, "private"),
    ).rejects.toMatchObject({ code: "forbidden" });
  });

  it("deletes a room and all room-scoped local data", async () => {
    await roomRepository.deleteRoom(fixtureIds.rooms.shared);
    const database = store.read();

    expect(await roomRepository.getById(fixtureIds.rooms.shared)).toBeNull();
    expect(
      database.memberships.some(
        (membership) => membership.roomId === fixtureIds.rooms.shared,
      ),
    ).toBe(false);
    expect(
      database.wishlists.some(
        (wishlist) => wishlist.roomId === fixtureIds.rooms.shared,
      ),
    ).toBe(false);
    expect(
      database.visibilityGrants.some(
        (grant) => grant.roomId === fixtureIds.rooms.shared,
      ),
    ).toBe(false);
    expect(
      database.activityEvents.some(
        (event) => event.roomId === fixtureIds.rooms.shared,
      ),
    ).toBe(false);
  });

  it("rejects room deletion by a regular member", async () => {
    store.mutate((database) => {
      database.currentUserId = fixtureIds.users.sharedMember;
    });

    await expect(
      roomRepository.deleteRoom(fixtureIds.rooms.shared),
    ).rejects.toMatchObject({ code: "forbidden" });
    expect(await roomRepository.getById(fixtureIds.rooms.shared)).not.toBeNull();
  });
});
