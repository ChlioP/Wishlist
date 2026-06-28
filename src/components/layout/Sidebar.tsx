import {
  Bell,
  Heart,
  LayoutDashboard,
  LogIn,
  UsersRound,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/classes";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: Heart, label: "My Wishlist", to: "/wishlist" },
  { icon: UsersRound, label: "Rooms", to: "/rooms" },
  { icon: Bell, label: "Notifications", to: "/notifications", count: 3 },
];

const rooms = [
  {
    color: "bg-primary",
    label: "Birthday Party",
    to: "/rooms/room-shared",
  },
  {
    color: "bg-lavender",
    label: "Secret Santa",
    to: "/rooms/room-private",
  },
  {
    color: "bg-emerald-200",
    label: "Family Gifts",
    to: "/rooms/room-public",
  },
];

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-20 flex min-h-[calc(100vh-6rem)] flex-col rounded-card border border-soft bg-surface p-4 shadow-card">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          Menu
        </p>
        <nav aria-label="Sidebar navigation" className="space-y-1">
          {menuItems.map(({ count, icon: Icon, label, to }) => (
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
              {count ? (
                <Badge className="ml-auto" variant="pink">
                  {count}
                </Badge>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <p className="mt-7 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          My Rooms
        </p>
        <div className="space-y-1">
          {rooms.map((room) => (
            <NavLink
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-blush"
              key={room.label}
              to={room.to}
            >
              <span
                aria-hidden="true"
                className={cn("h-2 w-2 rounded-full", room.color)}
              />
              <span className="truncate">{room.label}</span>
            </NavLink>
          ))}
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
