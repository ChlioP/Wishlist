import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { AccountPreferences } from "@/components/settings/AccountPreferences";
import { NotificationPreferences } from "@/components/settings/NotificationPreferences";
import {
  ProfileForm,
  type ProfileFormValues,
} from "@/components/settings/ProfileForm";
import { ThemePreference } from "@/components/settings/ThemePreference";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { localRepositories } from "@/data/repositories/local";
import { useAuth } from "@/features/auth/AuthContext";
import type { UserPreferences } from "@/types/domain";

type Feedback =
  | { kind: "error" | "success"; message: string }
  | null;

export function ProfileSettingsPage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(
    user?.preferences ?? null,
  );
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [savingPreferences, setSavingPreferences] = useState(false);

  useEffect(() => {
    setPreferences(user?.preferences ?? null);
  }, [user]);

  if (!user || !preferences) {
    return (
      <Card className="text-center">
        <h1 className="font-display text-2xl text-ink">
          Settings unavailable
        </h1>
        <p className="mt-2 text-sm text-muted">
          Sign in again to manage your profile.
        </p>
      </Card>
    );
  }

  async function saveProfile(values: ProfileFormValues) {
    setFeedback(null);
    try {
      await localRepositories.auth.updateProfile({
        avatarUrl: values.avatarUrl || undefined,
        displayName: values.displayName,
      });
      setFeedback({
        kind: "success",
        message: "Profile details saved.",
      });
    } catch {
      setFeedback({
        kind: "error",
        message: "Profile details could not be saved.",
      });
    }
  }

  function updatePreference(patch: Partial<UserPreferences>) {
    setPreferences((current) =>
      current ? { ...current, ...patch } : current,
    );
    setFeedback(null);
  }

  async function savePreferences() {
    if (!preferences) return;
    setSavingPreferences(true);
    setFeedback(null);
    try {
      await localRepositories.auth.updatePreferences(preferences);
      setFeedback({
        kind: "success",
        message: "Account preferences saved.",
      });
    } catch {
      setFeedback({
        kind: "error",
        message: "Account preferences could not be saved.",
      });
    } finally {
      setSavingPreferences(false);
    }
  }

  const preferencesChanged =
    JSON.stringify(preferences) !== JSON.stringify(user.preferences);

  return (
    <>
      <PageHeader
        subtitle="Update your account details and application preferences."
        title="Settings"
      />

      {feedback ? (
        <div
          aria-live="polite"
          className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
            feedback.kind === "success"
              ? "border-emerald-200 bg-success text-success-foreground"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
          role={feedback.kind === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <ProfileForm onSave={saveProfile} user={user} />
          <ThemePreference />
        </div>
        <div className="space-y-6">
          <AccountPreferences
            onChange={updatePreference}
            preferences={preferences}
          />
          <NotificationPreferences
            onChange={updatePreference}
            preferences={preferences}
          />
          <div className="flex justify-end">
            <Button
              disabled={!preferencesChanged || savingPreferences}
              leftIcon={<Save aria-hidden="true" />}
              onClick={() => void savePreferences()}
            >
              {savingPreferences ? "Saving…" : "Save preferences"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
