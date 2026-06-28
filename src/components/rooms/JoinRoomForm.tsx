import { KeyRound, LogIn } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { RepositoryError } from "@/data/repositories/errors";

interface JoinRoomFormProps {
  onJoin: (inviteCode: string) => Promise<void>;
}

export function JoinRoomForm({ onJoin }: JoinRoomFormProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inviteCode.trim()) {
      setError("Enter a room invite code.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onJoin(inviteCode);
      setInviteCode("");
    } catch (caught) {
      setError(
        caught instanceof RepositoryError
          ? caught.message
          : "The room could not be joined.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-purple text-purple-foreground">
        <KeyRound aria-hidden="true" className="h-5 w-5" />
      </span>
      <h2 className="mt-5 font-display text-2xl text-ink">Join by code</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Ask a room member for their invitation code.
      </p>
      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <Input
          autoComplete="off"
          error={error || undefined}
          label="Invite code"
          onChange={(event) => setInviteCode(event.target.value)}
          placeholder="BIRTHDAY-26"
          value={inviteCode}
        />
        <Button
          className="w-full"
          disabled={submitting}
          leftIcon={<LogIn aria-hidden="true" />}
          type="submit"
        >
          {submitting ? "Joining…" : "Join room"}
        </Button>
      </form>
    </Card>
  );
}
