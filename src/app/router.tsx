import { Navigate, createBrowserRouter } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { AdminRoute } from "@/components/navigation/AdminRoute";
import { ProtectedRoute } from "@/components/navigation/ProtectedRoute";
import { PublicOnlyRoute } from "@/components/navigation/PublicOnlyRoute";
import { DashboardPage } from "@/pages/DashboardPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import {
  ActivityPage,
  NotificationsPage,
  ProfileSettingsPage,
  RoomActivityPage,
  RoomMembersPage,
  RoomSettingsPage,
  SharedWishlistPage,
} from "@/pages/PlaceholderPages";
import { RegisterPage } from "@/pages/RegisterPage";
import { RoomDetailPage } from "@/pages/RoomDetailPage";
import { RoomsPage } from "@/pages/RoomsPage";
import { WishlistPage } from "@/pages/WishlistPage";

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <Navigate replace to="/dashboard" /> },
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/wishlist", element: <WishlistPage /> },
          { path: "/wishlist/new", element: <WishlistPage /> },
          {
            path: "/wishlist/:wishlistId",
            element: <SharedWishlistPage />,
          },
          { path: "/rooms", element: <RoomsPage /> },
          {
            path: "/rooms/:roomId",
            element: <RoomDetailPage />,
          },
          {
            path: "/rooms/:roomId/members",
            element: <RoomMembersPage />,
          },
          {
            element: <AdminRoute />,
            children: [
              {
                path: "/rooms/:roomId/activity",
                element: <RoomActivityPage />,
              },
              {
                path: "/rooms/:roomId/settings",
                element: <RoomSettingsPage />,
              },
            ],
          },
          { path: "/activity", element: <ActivityPage /> },
          { path: "/notifications", element: <NotificationsPage /> },
          {
            path: "/settings",
            element: <Navigate replace to="/settings/profile" />,
          },
          {
            path: "/settings/profile",
            element: <ProfileSettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
