import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthContext";

export function ProtectedRoute() {
  const { isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-cream text-sm text-muted">
        Loading WishList Hub…
      </main>
    );
  }

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}
