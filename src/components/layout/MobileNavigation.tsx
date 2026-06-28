import { Heart, Home, UsersRound } from "lucide-react";

import { cn } from "@/lib/classes";

const items = [
  { icon: Home, label: "Home" },
  { icon: Heart, label: "Wishlist" },
  { icon: UsersRound, label: "Rooms" },
];

export function MobileNavigation() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-3xl border border-soft bg-surface/95 px-3 py-2 shadow-soft backdrop-blur lg:hidden"
    >
      {items.map(({ icon: Icon, label }, index) => (
        <button
          className={cn(
            "flex min-w-20 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px]",
            index === 0 ? "bg-blush text-ink" : "text-muted",
          )}
          key={label}
          type="button"
        >
          <Icon aria-hidden="true" className="h-4 w-4" />
          {label}
        </button>
      ))}
    </nav>
  );
}
