import { Bell } from "lucide-react";

import { PreferenceToggle } from "@/components/settings/PreferenceToggle";
import { Card } from "@/components/ui/Card";
import type { UserPreferences } from "@/types/domain";

interface NotificationPreferencesProps {
  onChange: (patch: Partial<UserPreferences>) => void;
  preferences: UserPreferences;
}

export function NotificationPreferences({
  onChange,
  preferences,
}: NotificationPreferencesProps) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-purple text-purple-foreground">
          <Bell aria-hidden="true" className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-display text-2xl text-ink">
            Notification preferences
          </h2>
          <p className="mt-1 text-sm text-muted">
            Choose which updates should notify you.
          </p>
        </div>
      </div>
      <div className="mt-4 divide-y divide-soft">
        <PreferenceToggle
          checked={preferences.emailNotifications}
          description="Enable the master switch for future email delivery."
          label="Email notifications"
          onChange={(checked) => onChange({ emailNotifications: checked })}
        />
        <PreferenceToggle
          checked={preferences.joinRequestNotifications}
          description="Notify you when someone requests access to a room you manage."
          label="Join requests"
          onChange={(checked) =>
            onChange({ joinRequestNotifications: checked })
          }
        />
        <PreferenceToggle
          checked={preferences.roomActivityNotifications}
          description="Receive updates about membership and room changes."
          label="Room activity"
          onChange={(checked) =>
            onChange({ roomActivityNotifications: checked })
          }
        />
        <PreferenceToggle
          checked={preferences.wishlistUpdateNotifications}
          description="Receive updates when visible wishlists change."
          label="Wishlist updates"
          onChange={(checked) =>
            onChange({ wishlistUpdateNotifications: checked })
          }
        />
      </div>
    </Card>
  );
}
