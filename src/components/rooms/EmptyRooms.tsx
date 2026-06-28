import { Plus, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface EmptyRoomsProps {
  onCreate: () => void;
}

export function EmptyRooms({ onCreate }: EmptyRoomsProps) {
  return (
    <Card className="relative overflow-hidden py-12 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-primary to-lavender text-white">
        <UsersRound aria-hidden="true" className="h-7 w-7" />
      </span>
      <h2 className="mt-6 font-display text-3xl text-ink">No rooms yet</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
        Create a room for your group or use the invite-code form to join an
        existing one.
      </p>
      <Button
        className="mt-6"
        leftIcon={<Plus aria-hidden="true" />}
        onClick={onCreate}
      >
        Create your first room
      </Button>
    </Card>
  );
}
