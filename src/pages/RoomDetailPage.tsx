import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { InviteCodePanel } from "@/components/rooms/InviteCodePanel";
import { RoomHeader } from "@/components/rooms/RoomHeader";
import { RoomMemberList } from "@/components/rooms/RoomMemberList";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { RoomMember } from "@/data/repositories/contracts";
import { localRepositories } from "@/data/repositories/local";
import { useAuth } from "@/features/auth/AuthContext";
import type { Room } from "@/types/domain";

interface RoomDetailData {
  members: RoomMember[];
  room: Room;
}

export function RoomDetailPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<RoomDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setData(null);
    setLoading(true);
    setError("");
    if (!user || !roomId) {
      setLoading(false);
      return;
    }
    const currentUser = user;
    const currentRoomId = roomId;

    async function loadRoom() {
      try {
        const joinedRooms =
          await localRepositories.rooms.listForUser(currentUser.id);
        const isMember = joinedRooms.some(
          (room) => room.id === currentRoomId,
        );
        if (!isMember) {
          if (active) {
            setError("You do not have access to this room.");
            setLoading(false);
          }
          return;
        }

        const [room, members] = await Promise.all([
          localRepositories.rooms.getById(currentRoomId),
          localRepositories.rooms.listMembers(currentRoomId),
        ]);
        if (!room) {
          if (active) {
            setError("This room could not be found.");
            setLoading(false);
          }
          return;
        }
        if (active) {
          setData({ members, room });
          setLoading(false);
        }
      } catch {
        if (active) {
          setError("Room details could not be loaded.");
          setLoading(false);
        }
      }
    }

    void loadRoom();
    return () => {
      active = false;
    };
  }, [roomId, user]);

  if (loading) {
    return (
      <div aria-live="polite" role="status">
        <span className="sr-only">Loading room details.</span>
        <Card className="motion-safe:animate-pulse">
          <div className="h-10 w-1/2 rounded-full bg-blush" />
          <div className="mt-4 h-4 w-3/4 rounded-full bg-cream" />
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card padding="none">
        <EmptyState
          action={
            <Link
              className="text-sm font-medium text-primary-dark hover:underline"
              to="/rooms"
            >
              Return to your rooms
            </Link>
          }
          description={error || "Room details are unavailable."}
          icon={LockKeyhole}
          title="Room unavailable"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <RoomHeader memberCount={data.members.length} room={data.room} />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <RoomMemberList members={data.members} />
        <InviteCodePanel inviteCode={data.room.inviteCode} />
      </div>
    </div>
  );
}
