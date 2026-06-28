import { Bell, Gift, LogOut, Menu, Settings, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { localRepositories } from "@/data/repositories/local";
import { useAuth } from "@/features/auth/AuthContext";
import { cn } from "@/lib/classes";

const navigation = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "My Wishlist", to: "/wishlist" },
  { label: "Rooms", to: "/rooms" },
  { label: "Activity", to: "/activity" },
  { label: "Settings", to: "/settings/profile" },
];

export function TopNavigation() {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const currentUser = user;
    function updateCount() {
      void localRepositories.notifications
        .listForUser(currentUser.id)
        .then((notifications) =>
          setUnreadCount(
            notifications.filter((notification) => !notification.readAt)
              .length,
          ),
        );
    }
    updateCount();
    return localRepositories.notifications.subscribe(
      currentUser.id,
      (notifications) =>
        setUnreadCount(
          notifications.filter((notification) => !notification.readAt).length,
        ),
    );
  }, [user]);

  useEffect(() => {
    if (!menuOpen) return;
    function closeMenu(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-soft bg-surface/95 px-4 backdrop-blur sm:px-6">
      <Link className="flex min-w-0 items-center gap-3" to="/dashboard">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-blush text-primary-dark">
          <Gift aria-hidden="true" className="h-4 w-4" />
        </span>
        <span className="truncate font-display text-xl text-ink">
          WishList Hub
        </span>
      </Link>

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

      <div className="relative ml-auto flex items-center gap-2" ref={menuRef}>
        <Link
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          className="relative hidden h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-blush hover:text-ink sm:inline-flex"
          to="/notifications"
        >
          <Bell aria-hidden="true" className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 min-w-4 rounded-full bg-primary px-1 text-center text-[0.625rem] font-semibold leading-4 text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Link>
        <Avatar
          alt={user?.displayName ?? "Signed in user"}
          className="hidden sm:grid"
          src={user?.avatarUrl}
        />
        <Button
          aria-label="Sign out"
          className="hidden lg:inline-flex"
          onClick={handleSignOut}
          size="icon"
          variant="ghost"
        >
          <LogOut aria-hidden="true" />
        </Button>
        <Button
          aria-controls="mobile-user-menu"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close user menu" : "Open user menu"}
          className="lg:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          size="icon"
          variant="ghost"
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </Button>

        {menuOpen ? (
          <div
            className="absolute right-0 top-12 z-40 w-64 rounded-card border border-soft bg-white p-3 shadow-soft"
            id="mobile-user-menu"
          >
            <div className="flex items-center gap-3 border-b border-soft px-2 pb-3">
              <Avatar
                alt={user?.displayName ?? "Signed in user"}
                src={user?.avatarUrl}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {user?.displayName}
                </p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </div>
            </div>
            <Link
              className="mt-2 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-ink hover:bg-blush"
              onClick={() => setMenuOpen(false)}
              to="/settings/profile"
            >
              <Settings aria-hidden="true" className="h-4 w-4" />
              Profile settings
            </Link>
            <button
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-red-700 hover:bg-red-50"
              onClick={() => void handleSignOut()}
              type="button"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
