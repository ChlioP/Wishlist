import { AlertTriangle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface DangerZoneProps {
  canDelete: boolean;
  onDelete: () => Promise<void>;
  roomName: string;
}

export function DangerZone({
  canDelete,
  onDelete,
  roomName,
}: DangerZoneProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section aria-labelledby="danger-zone-heading">
      <h2
        className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-700"
        id="danger-zone-heading"
      >
        <AlertTriangle aria-hidden="true" className="h-4 w-4" />
        Danger zone
      </h2>
      <Card className="border-red-200">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-semibold text-ink">Delete this room</h3>
            <p className="mt-1 text-xs leading-5 text-muted">
              Permanently delete {roomName}, its memberships, wishlists, items,
              reservations, and visibility settings.
            </p>
            {!canDelete ? (
              <p className="mt-2 text-xs font-medium text-red-700">
                Owner or administrator permission is required.
              </p>
            ) : null}
          </div>
          {!confirming ? (
            <Button
              disabled={!canDelete}
              onClick={() => setConfirming(true)}
              variant="danger"
            >
              Delete room
            </Button>
          ) : (
            <div
              aria-label="Confirm room deletion"
              className="flex flex-wrap gap-2"
              role="group"
            >
              <Button
                disabled={deleting}
                onClick={() => setConfirming(false)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                disabled={deleting}
                onClick={() => void handleDelete()}
                variant="danger"
              >
                {deleting ? "Deleting…" : "Delete permanently"}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}
