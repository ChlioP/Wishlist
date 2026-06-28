import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function DangerZone() {
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
              Permanent room deletion is intentionally disabled in the mock
              implementation.
            </p>
          </div>
          <Button disabled variant="danger">
            Delete room
          </Button>
        </div>
      </Card>
    </section>
  );
}
