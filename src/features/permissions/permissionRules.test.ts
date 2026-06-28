import { describe, expect, it } from "vitest";

import { createSeedDatabase } from "@/data/mock/localStorage";
import { fixtureIds } from "@/data/mock/fixtures";
import {
  canEditWishlist,
  canManageRoom,
  canReserveItem,
  canViewWishlist,
} from "@/features/permissions/permissionRules";

function permissionContext(
  roomId: string,
  actorId: string,
  wishlistId: string,
) {
  const database = createSeedDatabase();
  const actor = database.users.find((user) => user.id === actorId)!;
  const room = database.rooms.find((candidate) => candidate.id === roomId)!;
  const wishlist = database.wishlists.find(
    (candidate) => candidate.id === wishlistId,
  )!;

  return {
    actor,
    grants: database.visibilityGrants,
    membership: database.memberships.find(
      (candidate) =>
        candidate.roomId === roomId && candidate.userId === actorId,
    ),
    ownerMembership: database.memberships.find(
      (candidate) =>
        candidate.roomId === roomId &&
        candidate.userId === wishlist.ownerId,
    ),
    room,
    wishlist,
  };
}

describe("permission helpers", () => {
  it("allows owners and admins to manage a room, but not members", () => {
    const owner = permissionContext(
      fixtureIds.rooms.shared,
      fixtureIds.users.admin,
      fixtureIds.wishlists.adminShared,
    );
    const admin = permissionContext(
      fixtureIds.rooms.shared,
      fixtureIds.users.member,
      fixtureIds.wishlists.adminShared,
    );
    const member = permissionContext(
      fixtureIds.rooms.shared,
      fixtureIds.users.sharedMember,
      fixtureIds.wishlists.adminShared,
    );

    expect(canManageRoom(owner)).toBe(true);
    expect(canManageRoom(admin)).toBe(true);
    expect(canManageRoom(member)).toBe(false);
  });

  it("enforces private, shared, and public wishlist visibility", () => {
    const privateContext = permissionContext(
      fixtureIds.rooms.private,
      fixtureIds.users.member,
      fixtureIds.wishlists.adminPrivate,
    );
    const grantedSharedContext = permissionContext(
      fixtureIds.rooms.shared,
      fixtureIds.users.sharedMember,
      fixtureIds.wishlists.memberShared,
    );
    const ungrantedSharedContext = permissionContext(
      fixtureIds.rooms.shared,
      fixtureIds.users.sharedMember,
      fixtureIds.wishlists.adminShared,
    );
    const publicContext = permissionContext(
      fixtureIds.rooms.public,
      fixtureIds.users.admin,
      fixtureIds.wishlists.memberPublic,
    );

    expect(canViewWishlist(privateContext)).toBe(false);
    expect(canViewWishlist(grantedSharedContext)).toBe(true);
    expect(canViewWishlist(ungrantedSharedContext)).toBe(false);
    expect(canViewWishlist(publicContext)).toBe(true);
  });

  it("only lets a wishlist owner edit their list", () => {
    const context = permissionContext(
      fixtureIds.rooms.shared,
      fixtureIds.users.admin,
      fixtureIds.wishlists.adminShared,
    );
    const otherUser = createSeedDatabase().users.find(
      (user) => user.id === fixtureIds.users.member,
    )!;

    expect(canEditWishlist(context.actor, context.wishlist)).toBe(true);
    expect(canEditWishlist(otherUser, context.wishlist)).toBe(false);
  });

  it("allows reserving only visible, available items owned by another user", () => {
    const context = permissionContext(
      fixtureIds.rooms.shared,
      fixtureIds.users.sharedMember,
      fixtureIds.wishlists.memberShared,
    );
    const database = createSeedDatabase();
    const availableItem = database.wishlistItems.find(
      (item) => item.id === "item-headphones",
    )!;

    expect(canReserveItem({ ...context, item: availableItem })).toBe(true);
    expect(
      canReserveItem({
        ...context,
        item: { ...availableItem, status: "reserved" },
      }),
    ).toBe(false);

    const ownerContext = permissionContext(
      fixtureIds.rooms.shared,
      fixtureIds.users.member,
      fixtureIds.wishlists.memberShared,
    );
    expect(canReserveItem({ ...ownerContext, item: availableItem })).toBe(false);
  });
});
