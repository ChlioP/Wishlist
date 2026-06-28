import { LockKeyhole, Share2, UsersRound } from "lucide-react";

import { cn } from "@/lib/classes";
import type { RoomPrivacyMode } from "@/types/domain";

interface PrivacyModeSelectorProps {
  onChange: (mode: RoomPrivacyMode) => Promise<void>;
  value: RoomPrivacyMode;
}

const modes = [
  {
    description: "Members see only their own wishlist. Admins can see all.",
    icon: LockKeyhole,
    label: "Private",
    value: "private",
  },
  {
    description: "Members see wishlists granted to them by an admin.",
    icon: Share2,
    label: "Shared",
    value: "shared",
  },
  {
    description: "Every active room member can view every wishlist.",
    icon: UsersRound,
    label: "Public",
    value: "public",
  },
] satisfies Array<{
  description: string;
  icon: typeof LockKeyhole;
  label: string;
  value: RoomPrivacyMode;
}>;

export function PrivacyModeSelector({
  onChange,
  value,
}: PrivacyModeSelectorProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">Privacy mode</legend>
      <p className="mt-1 text-xs leading-5 text-muted">
        Choose how room members can discover one another's wishlists.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const selected = value === mode.value;
          return (
            <button
              aria-pressed={selected}
              className={cn(
                "rounded-card border p-4 text-left transition-colors",
                selected
                  ? "border-primary bg-blush shadow-card"
                  : "border-soft bg-white hover:bg-cream",
              )}
              key={mode.value}
              onClick={() => void onChange(mode.value)}
              type="button"
            >
              <span
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-2xl",
                  selected
                    ? "bg-primary text-white"
                    : "bg-cream text-primary-dark",
                )}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
              </span>
              <span className="mt-4 block text-sm font-semibold text-ink">
                {mode.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted">
                {mode.description}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
