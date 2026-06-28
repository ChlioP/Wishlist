import { Gift, Plus, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";

export function FoundationPage() {
  return (
    <>
      <PageHeader
        action={
          <Button leftIcon={<Plus aria-hidden="true" />}>Add Item</Button>
        }
        eyebrow="Design system"
        subtitle="Shared foundations are ready for feature development."
        title="Hello, Alice"
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge icon={<Sparkles aria-hidden="true" />} variant="purple">
                Foundation ready
              </Badge>
              <h2 className="mt-4 font-display text-2xl">Prototype styling</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                Reusable tokens and controls now capture the soft, rounded visual
                language of the reference prototype.
              </p>
            </div>
            <Button variant="secondary">View tokens</Button>
          </div>

          <div className="mt-7 max-w-sm">
            <Input
              label="Sample input"
              placeholder="Birthday gift idea"
            />
          </div>
        </Card>

        <Card padding="none">
          <EmptyState
            action={<Button variant="secondary">Create room</Button>}
            description="Room features will be added in a later phase."
            icon={Gift}
            title="No rooms yet"
          />
        </Card>
      </div>
    </>
  );
}
