import { useEffect, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { User } from "@/types/domain";

export interface ProfileFormValues {
  avatarUrl: string;
  displayName: string;
}

interface ProfileFormProps {
  onSave: (values: ProfileFormValues) => Promise<void>;
  user: User;
}

export function ProfileForm({ onSave, user }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [errors, setErrors] = useState<Partial<ProfileFormValues>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDisplayName(user.displayName);
    setAvatarUrl(user.avatarUrl ?? "");
  }, [user]);

  function validate(): boolean {
    const nextErrors: Partial<ProfileFormValues> = {};
    if (displayName.trim().length < 2) {
      nextErrors.displayName = "Name must contain at least two characters.";
    }
    if (avatarUrl.trim()) {
      try {
        const url = new URL(avatarUrl);
        if (!["http:", "https:"].includes(url.protocol)) {
          nextErrors.avatarUrl = "Use an HTTP or HTTPS image URL.";
        }
      } catch {
        nextErrors.avatarUrl = "Enter a valid image URL.";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSave({
        avatarUrl: avatarUrl.trim(),
        displayName: displayName.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar
          alt={displayName || user.displayName}
          size="lg"
          src={avatarUrl || undefined}
        />
        <div>
          <h2 className="font-display text-2xl text-ink">Profile details</h2>
          <p className="mt-1 text-sm text-muted">
            Update the name and image shown throughout WishList Hub.
          </p>
        </div>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <Input
          autoComplete="name"
          error={errors.displayName}
          label="Display name"
          onChange={(event) => setDisplayName(event.target.value)}
          value={displayName}
        />
        <Input
          disabled
          hint="Email changes are unavailable with mock authentication."
          label="Email address"
          type="email"
          value={user.email}
        />
        <Input
          error={errors.avatarUrl}
          label="Avatar URL"
          onChange={(event) => setAvatarUrl(event.target.value)}
          placeholder="https://example.com/avatar.jpg"
          type="url"
          value={avatarUrl}
        />
        <div className="flex justify-end border-t border-soft pt-5">
          <Button disabled={submitting} type="submit">
            {submitting ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
