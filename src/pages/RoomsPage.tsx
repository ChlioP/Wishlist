import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  CreateRoomDialog,
  type CreateRoomValues,
} from "@/components/rooms/CreateRoomDialog";
import { EmptyRooms } from "@/components/rooms/EmptyRooms";
import { JoinRoomForm } from "@/components/rooms/JoinRoomForm";
import {
  RoomCard,
  type RoomCardData,
} from "@/components/rooms/RoomCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { localRepositories } from "@/data/repositories/local";
import { useAuth } from "@/features/auth/AuthContext";

export function RoomsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<RoomCardData[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    if (!user) return;
    const currentUser = user;

    async function loadRooms() {
      try {
        const joinedRooms =
          await localRepositories.rooms.listForUser(currentUser.id);
        const summaries = await Promise.all(
          joinedRooms.map(async (room) => {
            const members = await localRepositories.rooms.listMembers(room.id);
            const membership = members.find(
              (member) => member.userId === currentUser.id,
            );
            return membership
              ? { memberCount: members.length, membership, room }
              : null;
          }),
        );
        if (active) {
          setRooms(
            summaries.filter(
              (summary): summary is RoomCardData => summary !== null,
            ),
          );
          setLoading(false);
        }
      } catch {
        if (active) {
          setError("Your rooms could not be loaded.");
          setLoading(false);
        }
      }
    }

    void loadRooms();
    return () => {
      active = false;
    };
  }, [user]);

  async function createRoom(values: CreateRoomValues) {
    if (!user) return;
    const room = await localRepositories.rooms.create({
      description: values.description,
      name: values.name,
      ownerId: user.id,
    });
    setCreateOpen(false);
    navigate(`/rooms/${room.id}`);
  }

  async function joinRoom(inviteCode: string) {
    if (!user) return;
    const membership = await localRepositories.rooms.joinByCode(
      user.id,
      inviteCode,
    );
    navigate(`/rooms/${membership.roomId}`);
  }

  return (
    <>
      <PageHeader
        action={
          <Button
            leftIcon={<Plus aria-hidden="true" />}
            onClick={() => setCreateOpen(true)}
          >
            Create Room
          </Button>
        }
        subtitle="View and manage your shared gifting spaces."
        title="Your rooms"
      />

      {loading ? (
        <RoomsLoadingState />
      ) : error ? (
        <Card className="text-center" role="alert">
          <h2 className="font-display text-2xl text-ink">Rooms unavailable</h2>
          <p className="mt-2 text-sm text-muted">{error}</p>
        </Card>
      ) : (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section aria-labelledby="joined-rooms-heading">
            <h2
              className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink"
              id="joined-rooms-heading"
            >
              <span className="h-2 w-2 rounded-full bg-primary" />
              Joined rooms
            </h2>
            {rooms.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {rooms.map((room) => (
                  <RoomCard data={room} key={room.room.id} />
                ))}
              </div>
            ) : (
              <EmptyRooms onCreate={() => setCreateOpen(true)} />
            )}
          </section>
          <JoinRoomForm onJoin={joinRoom} />
        </div>
      )}

      <CreateRoomDialog
        onClose={() => setCreateOpen(false)}
        onCreate={createRoom}
        open={createOpen}
      />
    </>
  );
}

function RoomsLoadingState() {
  return (
    <div
      aria-live="polite"
      className="grid gap-4 md:grid-cols-2"
      role="status"
    >
      <span className="sr-only">Loading joined rooms.</span>
      {[0, 1].map((item) => (
        <Card className="motion-safe:animate-pulse" key={item}>
          <div className="h-12 w-12 rounded-2xl bg-blush" />
          <div className="mt-5 h-6 w-1/2 rounded-full bg-blush" />
          <div className="mt-4 h-4 w-full rounded-full bg-cream" />
          <div className="mt-2 h-4 w-2/3 rounded-full bg-cream" />
        </Card>
      ))}
    </div>
  );
}
