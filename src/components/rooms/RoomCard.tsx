import { ArrowRight, Crown, LockKeyhole, Share2, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { RoomMember } from "@/data/repositories/contracts";
import type { Room } from "@/types/domain";

export interface RoomCardData {
  memberCount: number;
  membership: RoomMember;
  room: Room;
}

interface RoomCardProps {
  data: RoomCardData;
}

const privacyConfig = {
  private: { icon: LockKeyhole, variant: "pink" as const },
  shared: { icon: Share2, variant: "purple" as const },
  public: { icon: UsersRound, variant: "success" as const },
};

export function RoomCard({ data }: RoomCardProps) {
  const { memberCount, membership, room } = data;
  const privacy = privacyConfig[room.privacyMode];
  const PrivacyIcon = privacy.icon;

  return (
    <Card className="group flex h-full flex-col" padding="lg">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blush to-purple text-primary-dark">
          <PrivacyIcon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="flex flex-wrap justify-end gap-2">
          <Badge className="capitalize" variant={privacy.variant}>
            {room.privacyMode}
          </Badge>
          {membership.role !== "member" ? (
            <Badge icon={<Crown aria-hidden="true" />} variant="purple">
              {membership.role === "owner" ? "Owner" : "Admin"}
            </Badge>
          ) : null}
        </div>
      </div>

      <h2 className="mt-5 font-display text-2xl text-ink">{room.name}</h2>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
        {room.description ?? "A private space for sharing gift ideas."}
      </p>

      <div className="mt-auto flex items-center justify-between gap-4 pt-6">
        <span className="inline-flex items-center gap-2 text-xs text-muted">
          <UsersRound aria-hidden="true" className="h-4 w-4" />
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </span>
        <Link
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-dark hover:underline"
          to={`/rooms/${room.id}`}
        >
          Open room
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </Card>
  );
}
