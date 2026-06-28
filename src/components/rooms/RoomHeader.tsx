import {
  ArrowLeft,
  LockKeyhole,
  Settings,
  Share2,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import type { Room } from "@/types/domain";

interface RoomHeaderProps {
  canManage?: boolean;
  memberCount: number;
  room: Room;
}

const privacyConfig = {
  private: { icon: LockKeyhole, variant: "pink" as const },
  shared: { icon: Share2, variant: "purple" as const },
  public: { icon: UsersRound, variant: "success" as const },
};

export function RoomHeader({
  canManage = false,
  memberCount,
  room,
}: RoomHeaderProps) {
  const privacy = privacyConfig[room.privacyMode];
  const PrivacyIcon = privacy.icon;

  return (
    <header>
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink"
        to="/rooms"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to rooms
      </Link>
      <div className="mt-5 flex flex-col justify-between gap-5 rounded-card border border-soft bg-white p-5 shadow-card sm:flex-row sm:items-center sm:p-7">
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-blush to-purple text-primary-dark">
            <PrivacyIcon aria-hidden="true" className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl text-ink sm:text-4xl">
                {room.name}
              </h1>
              <Badge className="capitalize" variant={privacy.variant}>
                {room.privacyMode}
              </Badge>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {room.description ?? "A shared space for thoughtful gift ideas."}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-cream px-4 py-3 text-sm text-muted">
            <UsersRound aria-hidden="true" className="h-4 w-4" />
            <span>
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </span>
          </div>
          {canManage ? (
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-soft bg-white px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-blush"
              to={`/rooms/${room.id}/settings`}
            >
              <Settings aria-hidden="true" className="h-4 w-4" />
              Room settings
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
