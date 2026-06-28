import { Gift, Plus, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "@/components/ui/Card";

export function EmptyDashboard() {
  return (
    <Card className="relative overflow-hidden py-14 text-center">
      <div
        aria-hidden="true"
        className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-blush/70"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-16 -right-12 h-48 w-48 rounded-full bg-lavender/35"
      />
      <div className="relative mx-auto max-w-md">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-primary to-lavender text-white shadow-soft">
          <Gift aria-hidden="true" className="h-7 w-7" />
        </span>
        <h2 className="mt-6 font-display text-3xl text-ink">
          Start your first room
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Create a gifting space or join friends with an invite code. Your
          dashboard will fill with room and wishlist updates.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            to="/rooms"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Create a room
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-soft bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-blush"
            to="/rooms"
          >
            <UsersRound aria-hidden="true" className="h-4 w-4" />
            Join a room
          </Link>
        </div>
      </div>
    </Card>
  );
}
