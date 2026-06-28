import { Bell, Gift, Menu } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

const navigation = ["Dashboard", "My Wishlist", "Rooms", "Settings"];

export function TopNavigation() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-soft bg-surface/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-blush text-primary-dark">
          <Gift aria-hidden="true" className="h-4 w-4" />
        </span>
        <span className="truncate font-display text-xl text-ink">
          WishList Hub
        </span>
      </div>

      <nav
        aria-label="Primary navigation"
        className="mx-auto hidden items-center gap-1 lg:flex"
      >
        {navigation.map((item, index) => (
          <button
            className={
              index === 0
                ? "rounded-full bg-blush px-4 py-2 text-sm font-medium text-ink"
                : "rounded-full px-4 py-2 text-sm text-muted transition-colors hover:bg-blush hover:text-ink"
            }
            key={item}
            type="button"
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <Button
          aria-label="Notifications"
          className="hidden sm:inline-flex"
          size="icon"
          variant="ghost"
        >
          <Bell aria-hidden="true" />
        </Button>
        <Avatar alt="Alice Lee" className="hidden sm:grid" />
        <Button
          aria-label="Open menu"
          className="lg:hidden"
          size="icon"
          variant="ghost"
        >
          <Menu aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}
