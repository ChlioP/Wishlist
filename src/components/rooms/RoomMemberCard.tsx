import { Crown, ShieldCheck } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import type { RoomMember } from "@/data/repositories/contracts";

interface RoomMemberCardProps {
  member: RoomMember;
}

export function RoomMemberCard({ member }: RoomMemberCardProps) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <Avatar
        alt={member.user.displayName}
        src={member.user.avatarUrl}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">
          {member.user.displayName}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted">
          {member.user.email}
        </p>
      </div>
      {member.role === "owner" ? (
        <Badge icon={<Crown aria-hidden="true" />} variant="purple">
          Owner
        </Badge>
      ) : member.role === "admin" ? (
        <Badge icon={<ShieldCheck aria-hidden="true" />} variant="pink">
          Admin
        </Badge>
      ) : (
        <Badge>Member</Badge>
      )}
    </div>
  );
}
