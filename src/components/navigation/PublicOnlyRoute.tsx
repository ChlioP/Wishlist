import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthContext";

export function PublicOnlyRoute() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-cream text-sm text-muted">
        Loading WishList Hub…
      </main>
    );
  }

  return user ? <Navigate replace to="/dashboard" /> : <Outlet />;
}
