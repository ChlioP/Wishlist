import { useEffect, useState } from "react";

import { ActivityTimeline } from "@/components/activity/ActivityTimeline";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { localRepositories } from "@/data/repositories/local";
import { useAuth } from "@/features/auth/AuthContext";
import type { ActivityEvent } from "@/types/domain";

export function ActivityPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setEvents([]);
    setLoading(true);
    setError("");
    if (!user) return;

    void localRepositories.activity
      .listForUser(user.id)
      .then((activity) => {
        if (active) setEvents(activity);
      })
      .catch(() => {
        if (active) setError("Your activity could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  return (
    <>
      <PageHeader
        action={
          !loading && !error ? (
            <Badge variant="purple">
              {events.length} {events.length === 1 ? "event" : "events"}
            </Badge>
          ) : null
        }
        subtitle="A record of changes you have made across rooms and wishlists."
        title="Your activity"
      />

      {loading ? (
        <ActivityLoadingState />
      ) : error ? (
        <Card className="text-center">
          <h2 className="font-display text-2xl text-ink">
            Activity unavailable
          </h2>
          <p className="mt-2 text-sm text-muted">{error}</p>
        </Card>
      ) : (
        <div className="mx-auto max-w-4xl">
          <ActivityTimeline events={events} />
        </div>
      )}
    </>
  );
}

function ActivityLoadingState() {
  return (
    <div
      aria-live="polite"
      className="mx-auto max-w-4xl space-y-4"
      role="status"
    >
      <span className="sr-only">Loading activity.</span>
      {[0, 1, 2].map((item) => (
        <div
          className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4"
          key={item}
        >
          <div className="h-11 w-11 rounded-2xl bg-blush motion-safe:animate-pulse" />
          <Card className="motion-safe:animate-pulse" padding="md">
            <div className="h-4 w-48 rounded-full bg-blush" />
            <div className="mt-3 h-3 w-32 rounded-full bg-cream" />
          </Card>
        </div>
      ))}
    </div>
  );
}
