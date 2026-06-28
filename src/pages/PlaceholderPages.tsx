import {
  Activity,
  Bell,
  Heart,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { RoutePlaceholder } from "@/components/ui/RoutePlaceholder";

interface PlaceholderPageProps {
  description: string;
  icon: typeof Heart;
  title: string;
}

function PlaceholderPage({
  description,
  icon,
  title,
}: PlaceholderPageProps) {
  return (
    <>
      <PageHeader subtitle={description} title={title} />
      <RoutePlaceholder
        description="This route is wired and protected. Detailed features are intentionally deferred to a later phase."
        icon={icon}
        title="Coming in a later phase"
      />
    </>
  );
}

export function SharedWishlistPage() {
  return (
    <PlaceholderPage
      description="View a wishlist allowed by room permissions."
      icon={Heart}
      title="Shared Wishlist"
    />
  );
}

export function RoomsPage() {
  return (
    <PlaceholderPage
      description="View, create, and join shared spaces."
      icon={UsersRound}
      title="Rooms"
    />
  );
}

export function RoomOverviewPage() {
  return (
    <PlaceholderPage
      description="Room summary and permitted wishlists."
      icon={UsersRound}
      title="Room Overview"
    />
  );
}

export function RoomMembersPage() {
  return (
    <PlaceholderPage
      description="Members in this shared room."
      icon={UserRound}
      title="Room Members"
    />
  );
}

export function RoomActivityPage() {
  return (
    <PlaceholderPage
      description="Administrative activity for this room."
      icon={Activity}
      title="Room Activity"
    />
  );
}

export function RoomSettingsPage() {
  return (
    <PlaceholderPage
      description="Administrative room and visibility controls."
      icon={ShieldCheck}
      title="Room Settings"
    />
  );
}

export function ActivityPage() {
  return (
    <PlaceholderPage
      description="Your recent actions and changes."
      icon={Activity}
      title="Activity"
    />
  );
}

export function NotificationsPage() {
  return (
    <PlaceholderPage
      description="Updates across your rooms."
      icon={Bell}
      title="Notifications"
    />
  );
}

export function ProfileSettingsPage() {
  return (
    <PlaceholderPage
      description="Update your account and preferences."
      icon={Settings}
      title="Settings"
    />
  );
}
