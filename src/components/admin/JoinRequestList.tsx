import { Check, UserPlus, X } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { JoinRequest } from "@/types/domain";

interface JoinRequestListProps {
  onReview: (
    requestId: string,
    decision: "approved" | "rejected",
  ) => Promise<void>;
  requests: JoinRequest[];
}

export function JoinRequestList({
  onReview,
  requests,
}: JoinRequestListProps) {
  const pending = requests.filter(
    (request) => request.status === "pending",
  );

  return (
    <section aria-labelledby="join-requests-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2
          className="flex items-center gap-2 text-sm font-semibold text-ink"
          id="join-requests-heading"
        >
          <span className="h-2 w-2 rounded-full bg-primary" />
          Join requests
        </h2>
        <Badge variant={pending.length > 0 ? "pink" : "neutral"}>
          {pending.length} pending
        </Badge>
      </div>
      <Card padding="none">
        {pending.length > 0 ? (
          <div className="divide-y divide-soft">
            {pending.map((request) => (
              <div
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"
                key={request.id}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-lavender text-xs font-semibold text-white">
                  {request.userId.slice(-2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    Pending member
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    User ID: {request.userId}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    leftIcon={<X aria-hidden="true" />}
                    onClick={() => void onReview(request.id, "rejected")}
                    size="sm"
                    variant="secondary"
                  >
                    Decline
                  </Button>
                  <Button
                    leftIcon={<Check aria-hidden="true" />}
                    onClick={() => void onReview(request.id, "approved")}
                    size="sm"
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-40 flex-col items-center justify-center p-6 text-center">
            <UserPlus
              aria-hidden="true"
              className="h-6 w-6 text-primary-dark"
            />
            <p className="mt-3 text-sm font-medium text-ink">
              No pending requests
            </p>
            <p className="mt-1 text-xs text-muted">
              New requests will appear here.
            </p>
          </div>
        )}
      </Card>
    </section>
  );
}
