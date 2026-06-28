import { Activity, Bell, Heart, Home, UsersRound } from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/classes";

const items = [
  { icon: Home, label: "Home", to: "/dashboard" },
  { icon: Heart, label: "Wishlist", to: "/wishlist" },
  { icon: UsersRound, label: "Rooms", to: "/rooms" },
  { icon: Activity, label: "Activity", to: "/activity" },
  { icon: Bell, label: "Alerts", to: "/notifications" },
];

export function MobileNavigation() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-30 grid grid-cols-5 rounded-3xl border border-soft bg-surface/95 p-1.5 shadow-soft backdrop-blur lg:hidden"
    >
      {items.map(({ icon: Icon, label, to }) => (
        <NavLink
          className={({ isActive }) =>
            cn(
              "flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-xs transition-colors",
              isActive
                ? "bg-blush font-medium text-ink"
                : "text-muted hover:bg-cream hover:text-ink",
            )
          }
          key={to}
          to={to}
        >
          <Icon aria-hidden="true" className="h-4 w-4" />
          <span className="max-w-full truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
