import { useEffect, useState } from "react";
import { Bell, Heart, UsersRound } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { localRepositories } from "@/data/repositories/local";
import { useAuth } from "@/features/auth/AuthContext";
import type { Notification, Room, Wishlist } from "@/types/domain";

interface DashboardData {
  notifications: Notification[];
  rooms: Room[];
  wishlists: Wishlist[];
}

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    let active = true;
    if (!user) return;
    void Promise.all([
      localRepositories.rooms.listForUser(user.id),
      localRepositories.notifications.listForUser(user.id),
    ]).then(async ([rooms, notifications]) => {
      const visibleLists = await Promise.all(
        rooms.map((room) =>
          localRepositories.wishlists.getVisible(room.id, user.id),
        ),
      );
      if (active) {
        setData({
          rooms,
          notifications,
          wishlists: visibleLists.flat(),
        });
      }
    });
    return () => {
      active = false;
    };
  }, [user]);

  const stats = [
    {
      icon: Heart,
      label: "Visible wishlists",
      value: data?.wishlists.length ?? "—",
    },
    {
      icon: UsersRound,
      label: "Rooms joined",
      value: data?.rooms.length ?? "—",
    },
    {
      icon: Bell,
      label: "Unread notifications",
      value:
        data?.notifications.filter((notification) => !notification.readAt)
          .length ?? "—",
    },
  ];

  return (
    <>
      <PageHeader
        subtitle="Here's what's happening in your rooms today."
        title={`Hello, ${user?.displayName.split(" ")[0] ?? "friend"}`}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <Card key={label} padding="md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                {label}
              </p>
              <Icon aria-hidden="true" className="h-4 w-4 text-primary-dark" />
            </div>
            <p className="mt-4 font-display text-4xl text-ink">{value}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl">Your rooms</h2>
            <p className="mt-1 text-sm text-muted">
              Fixture-backed room data from the local repository.
            </p>
          </div>
          <Badge variant="pink">{data?.rooms.length ?? 0} joined</Badge>
        </div>
        <div className="mt-5 divide-y divide-soft">
          {data?.rooms.map((room) => (
            <div
              className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              key={room.id}
            >
              <div>
                <p className="font-medium">{room.name}</p>
                <p className="mt-1 text-xs capitalize text-muted">
                  {room.privacyMode} visibility
                </p>
              </div>
              <Badge variant={room.privacyMode === "public" ? "success" : "purple"}>
                {room.privacyMode}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
