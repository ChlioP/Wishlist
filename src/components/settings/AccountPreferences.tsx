import { UserRound } from "lucide-react";

import { PreferenceToggle } from "@/components/settings/PreferenceToggle";
import { Card } from "@/components/ui/Card";
import type { UserPreferences } from "@/types/domain";

interface AccountPreferencesProps {
  onChange: (patch: Partial<UserPreferences>) => void;
  preferences: UserPreferences;
}

export function AccountPreferences({
  onChange,
  preferences,
}: AccountPreferencesProps) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blush text-primary-dark">
          <UserRound aria-hidden="true" className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-display text-2xl text-ink">
            Account preferences
          </h2>
          <p className="mt-1 text-sm text-muted">
            Control how your profile appears to room members.
          </p>
        </div>
      </div>
      <div className="mt-4 divide-y divide-soft">
        <PreferenceToggle
          checked={preferences.showEmailToRoomMembers}
          description="Allow active room members to see your account email."
          label="Show email to room members"
          onChange={(checked) =>
            onChange({ showEmailToRoomMembers: checked })
          }
        />
      </div>
    </Card>
  );
}
