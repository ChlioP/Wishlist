import { Check, Monitor, Moon, Sun } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

const themes = [
  { icon: Monitor, label: "System", selected: true },
  { icon: Sun, label: "Light", selected: false },
  { icon: Moon, label: "Dark", selected: false },
];

export function ThemePreference() {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-ink">Theme preference</h2>
          <p className="mt-1 text-sm text-muted">
            Theme switching will be enabled in a future phase.
          </p>
        </div>
        <Badge variant="neutral">Coming later</Badge>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {themes.map(({ icon: Icon, label, selected }) => (
          <button
            aria-disabled="true"
            className={`relative flex items-center gap-3 rounded-2xl border p-4 text-left ${
              selected
                ? "border-primary bg-blush text-ink"
                : "cursor-not-allowed border-soft bg-cream text-muted opacity-60"
            }`}
            disabled
            key={label}
            type="button"
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            <span className="text-sm font-medium">{label}</span>
            {selected ? (
              <Check
                aria-hidden="true"
                className="ml-auto h-4 w-4 text-primary-dark"
              />
            ) : null}
          </button>
        ))}
      </div>
    </Card>
  );
}
