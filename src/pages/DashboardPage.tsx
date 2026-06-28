import { useEffect, useState } from "react";
import { Bell, Heart, Plus, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

import { EmptyDashboard } from "@/components/dashboard/EmptyDashboard";
import { RecentNotifications } from "@/components/dashboard/RecentNotifications";
import { RoomSummaryList } from "@/components/dashboard/RoomSummaryList";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import type { StatCardProps } from "@/components/dashboard/StatCard";
import {
  WishlistPreviewCard,
  type WishlistPreview,
} from "@/components/dashboard/WishlistPreviewCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { localRepositories } from "@/data/repositories/local";
import { useAuth } from "@/features/auth/AuthContext";
import type { Notification, Room } from "@/types/domain";

interface DashboardData {
  hasOwnWishlist: boolean;
  notifications: Notification[];
  ownItemCount: number;
  rooms: Room[];
  wishlistPreviews: WishlistPreview[];
}

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    if (!user) return;
    const currentUser = user;

    async function loadDashboard() {
      try {
        const [rooms, notifications] = await Promise.all([
          localRepositories.rooms.listForUser(currentUser.id),
          localRepositories.notifications.listForUser(currentUser.id),
        ]);
        const wishlistsByRoom = await Promise.all(
          rooms.map((room) =>
            localRepositories.wishlists.getVisible(room.id, currentUser.id),
          ),
        );
        const wishlists = wishlistsByRoom.flat();
        const previewWishlists = wishlists.slice(0, 4);
        const ownedWishlists = wishlists.filter(
          (wishlist) => wishlist.ownerId === currentUser.id,
        );
        const itemTargets = Array.from(
          new Map(
            [...previewWishlists, ...ownedWishlists].map((wishlist) => [
              wishlist.id,
              wishlist,
            ]),
          ).values(),
        );
        const wishlistResults = await Promise.all(
          itemTargets.map(async (wishlist) => {
            try {
              const items = await localRepositories.wishlists.listItems(
                wishlist.id,
                currentUser.id,
              );
              return { items, wishlist };
            } catch {
              return { items: null, wishlist };
            }
          }),
        );
        if (!active) return;

        const itemsByWishlistId = new Map(
          wishlistResults
            .filter(
              (
                result,
              ): result is {
                items: NonNullable<(typeof result)["items"]>;
                wishlist: (typeof result)["wishlist"];
              } => result.items !== null,
            )
            .map((result) => [result.wishlist.id, result.items] as const),
        );
        const roomNames = new Map(
          rooms.map((room) => [room.id, room.name] as const),
        );
        const wishlistPreviews = previewWishlists.map((wishlist) => ({
          items: itemsByWishlistId.get(wishlist.id) ?? [],
          roomName: roomNames.get(wishlist.roomId) ?? "Room",
          wishlist,
        }));
        setData({
          hasOwnWishlist: ownedWishlists.length > 0,
          notifications,
          ownItemCount: ownedWishlists.reduce(
            (count, wishlist) =>
              count + (itemsByWishlistId.get(wishlist.id)?.length ?? 0),
            0,
          ),
          rooms,
          wishlistPreviews,
        });
      } catch {
        if (active) {
          setError("Dashboard data could not be loaded.");
        }
      }
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <>
      <PageHeader
        action={
          data?.hasOwnWishlist ? (
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              to="/wishlist/new"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add Item
            </Link>
          ) : null
        }
        subtitle="Here's what's happening in your rooms today."
        title={`Hello, ${user?.displayName.split(" ")[0] ?? "friend"}`}
      />

      {error ? (
        <Card className="text-center" role="alert">
          <h2 className="font-display text-2xl text-ink">
            Dashboard unavailable
          </h2>
          <p className="mt-2 text-sm text-muted">{error}</p>
        </Card>
      ) : !data ? (
        <DashboardSkeleton />
      ) : data.rooms.length === 0 ? (
        <EmptyDashboard />
      ) : (
        <DashboardContent data={data} />
      )}
    </>
  );
}

function DashboardContent({ data }: { data: DashboardData }) {
  const unreadCount = data.notifications.filter(
    (notification) => !notification.readAt,
  ).length;
  const stats: StatCardProps[] = [
    {
      detail: "Across your joined rooms",
      icon: Heart,
      label: "My wishlist items",
      value: data.ownItemCount,
    },
    {
      detail: "Private gifting spaces",
      icon: UsersRound,
      label: "Rooms joined",
      value: data.rooms.length,
    },
    {
      detail: unreadCount === 0 ? "You're all caught up" : "Waiting for you",
      icon: Bell,
      label: "Unread updates",
      value: unreadCount,
    },
  ];

  return (
    <div className="space-y-6">
      <StatsGrid stats={stats} />

      <section aria-labelledby="wishlist-preview-heading">
        <h2
          className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink"
          id="wishlist-preview-heading"
        >
          <span className="h-2 w-2 rounded-full bg-primary" />
          Wishlist previews
        </h2>
        {data.wishlistPreviews.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {data.wishlistPreviews.slice(0, 4).map((preview) => (
              <WishlistPreviewCard
                key={preview.wishlist.id}
                preview={preview}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center" padding="md">
            <p className="text-sm text-muted">
              No visible wishlists are available yet.
            </p>
          </Card>
        )}
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <RoomSummaryList rooms={data.rooms} />
        <RecentNotifications notifications={data.notifications} />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div
      aria-live="polite"
      aria-label="Loading dashboard"
      className="space-y-6"
      role="status"
    >
      <span className="sr-only">Loading dashboard content.</span>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Card className="motion-safe:animate-pulse" key={item} padding="md">
            <div className="h-3 w-28 rounded-full bg-blush" />
            <div className="mt-4 h-9 w-12 rounded-xl bg-blush" />
            <div className="mt-4 h-3 w-36 rounded-full bg-cream" />
          </Card>
        ))}
      </div>
      <Card className="motion-safe:animate-pulse">
        <div className="h-4 w-40 rounded-full bg-blush" />
        <div className="mt-5 h-32 rounded-2xl bg-cream" />
      </Card>
    </div>
  );
}
