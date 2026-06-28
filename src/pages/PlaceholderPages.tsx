import {
  Activity,
  Heart,
  Settings,
  UserRound,
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

export function ProfileSettingsPage() {
  return (
    <PlaceholderPage
      description="Update your account and preferences."
      icon={Settings}
      title="Settings"
    />
  );
}
