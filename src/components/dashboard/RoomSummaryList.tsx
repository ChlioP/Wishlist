import { ArrowRight, LockKeyhole, Share2, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Room } from "@/types/domain";

interface RoomSummaryListProps {
  rooms: Room[];
}

const roomMode = {
  private: {
    icon: LockKeyhole,
    variant: "pink" as const,
  },
  shared: {
    icon: Share2,
    variant: "purple" as const,
  },
  public: {
    icon: UsersRound,
    variant: "success" as const,
  },
};

export function RoomSummaryList({ rooms }: RoomSummaryListProps) {
  return (
    <section aria-labelledby="room-summary-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2
          className="flex items-center gap-2 text-sm font-semibold text-ink"
          id="room-summary-heading"
        >
          <span className="h-2 w-2 rounded-full bg-primary" />
          Your rooms
        </h2>
        <Link
          className="text-xs font-medium text-primary-dark hover:underline"
          to="/rooms"
        >
          View all
        </Link>
      </div>
      <Card padding="none">
        <div className="divide-y divide-soft">
          {rooms.map((room) => {
            const mode = roomMode[room.privacyMode];
            const Icon = mode.icon;
            return (
              <Link
                className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-blush/40"
                key={room.id}
                to={`/rooms/${room.id}`}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cream text-primary-dark">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {room.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {room.description ?? "A shared gifting space"}
                  </p>
                </div>
                <Badge className="capitalize" variant={mode.variant}>
                  {room.privacyMode}
                </Badge>
                <ArrowRight
                  aria-hidden="true"
                  className="hidden h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 sm:block"
                />
              </Link>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
