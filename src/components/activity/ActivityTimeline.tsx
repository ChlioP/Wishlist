import { Activity } from "lucide-react";

import { ActivityEventCard } from "@/components/activity/ActivityEventCard";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ActivityEvent } from "@/types/domain";

interface ActivityTimelineProps {
  events: ActivityEvent[];
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  if (events.length === 0) {
    return (
      <Card padding="none">
        <EmptyState
          description="Actions you take in rooms and wishlists will appear here."
          icon={Activity}
          title="No activity yet"
        />
      </Card>
    );
  }

  return (
    <ol aria-label="Your recent activity">
      {events.map((event, index) => (
        <ActivityEventCard
          event={event}
          isLast={index === events.length - 1}
          key={event.id}
        />
      ))}
    </ol>
  );
}
