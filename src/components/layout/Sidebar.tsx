import {
  Activity,
  Bell,
  Heart,
  LayoutDashboard,
  LogIn,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { localRepositories } from "@/data/repositories/local";
import { useAuth } from "@/features/auth/AuthContext";
import { cn } from "@/lib/classes";
import type { Room } from "@/types/domain";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: Heart, label: "My Wishlist", to: "/wishlist" },
  { icon: UsersRound, label: "Rooms", to: "/rooms" },
  { icon: Activity, label: "Activity", to: "/activity" },
  { icon: Bell, label: "Notifications", to: "/notifications" },
];

const roomColors = ["bg-primary", "bg-lavender", "bg-emerald-200"];

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;
    if (!user) return;
    const currentUser = user;
    void localRepositories.rooms
      .listForUser(currentUser.id)
      .then((items) => {
        if (active) setRooms(items);
      });
    void localRepositories.notifications
      .listForUser(currentUser.id)
      .then((notifications) => {
        if (active) {
          setUnreadCount(
            notifications.filter((notification) => !notification.readAt)
              .length,
          );
        }
      });
    const unsubscribe = localRepositories.notifications.subscribe(
      currentUser.id,
      (notifications) => {
        if (active) {
          setUnreadCount(
            notifications.filter((notification) => !notification.readAt)
              .length,
          );
        }
      },
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [location.pathname, user]);

  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-20 flex min-h-[calc(100vh-6rem)] max-h-[calc(100vh-6rem)] flex-col overflow-y-auto rounded-card border border-soft bg-surface p-4 shadow-card">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Menu
        </p>
        <nav aria-label="Sidebar navigation" className="space-y-1">
          {menuItems.map(({ icon: Icon, label, to }) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-colors",
                  isActive
                    ? "bg-blush font-medium text-ink"
                    : "text-muted hover:bg-blush hover:text-ink",
                )
              }
              key={to}
              to={to}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              <span>{label}</span>
              {to === "/notifications" && unreadCount > 0 ? (
                <Badge className="ml-auto" variant="pink">
                  <span className="sr-only">Unread notifications: </span>
                  {unreadCount}
                </Badge>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <p className="mt-7 px-3 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          My Rooms
        </p>
        <div className="space-y-1">
          {rooms.length > 0 ? (
            rooms.map((room, index) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-blush",
                    isActive && "bg-blush",
                  )
                }
                key={room.id}
                to={`/rooms/${room.id}`}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-2 w-2 rounded-full",
                    roomColors[index % roomColors.length],
                  )}
                />
                <span className="truncate">{room.name}</span>
              </NavLink>
            ))
          ) : (
            <p className="px-3 py-2 text-xs leading-5 text-muted">
              No rooms joined yet.
            </p>
          )}
        </div>

        <NavLink
          className="mt-auto flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-muted transition-colors hover:bg-blush hover:text-ink"
          to="/rooms"
        >
          <LogIn aria-hidden="true" className="h-4 w-4" />
          Join a Room
        </NavLink>
      </div>
    </aside>
  );
}
