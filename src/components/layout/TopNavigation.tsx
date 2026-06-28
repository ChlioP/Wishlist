import { Bell, Gift, LogOut, Menu } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthContext";
import { cn } from "@/lib/classes";

const navigation = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "My Wishlist", to: "/wishlist" },
  { label: "Rooms", to: "/rooms" },
  { label: "Settings", to: "/settings/profile" },
];

export function TopNavigation() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

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
        {navigation.map((item) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                "rounded-full px-4 py-2 text-sm transition-colors hover:bg-blush hover:text-ink",
                isActive ? "bg-blush font-medium text-ink" : "text-muted",
              )
            }
            key={item.to}
            to={item.to}
          >
            {item.label}
          </NavLink>
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
        <Avatar
          alt={user?.displayName ?? "Signed in user"}
          className="hidden sm:grid"
          src={user?.avatarUrl}
        />
        <Button
          aria-label="Sign out"
          className="hidden sm:inline-flex"
          onClick={handleSignOut}
          size="icon"
          variant="ghost"
        >
          <LogOut aria-hidden="true" />
        </Button>
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
