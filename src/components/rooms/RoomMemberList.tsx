import { UsersRound } from "lucide-react";

import { RoomMemberCard } from "@/components/rooms/RoomMemberCard";
import { Card } from "@/components/ui/Card";
import type { RoomMember } from "@/data/repositories/contracts";

interface RoomMemberListProps {
  members: RoomMember[];
}

export function RoomMemberList({ members }: RoomMemberListProps) {
  return (
    <section aria-labelledby="room-members-heading">
      <h2
        className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink"
        id="room-members-heading"
      >
        <span className="h-2 w-2 rounded-full bg-primary" />
        Room members
      </h2>
      <Card padding="none">
        {members.length > 0 ? (
          <div className="divide-y divide-soft">
            {members.map((member) => (
              <RoomMemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
            <UsersRound
              aria-hidden="true"
              className="h-6 w-6 text-primary-dark"
            />
            <p className="mt-3 text-sm font-medium text-ink">No members found</p>
          </div>
        )}
      </Card>
    </section>
  );
}
