import { Check, Copy, KeyRound } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface InviteCodePanelProps {
  inviteCode: string;
}

export function InviteCodePanel({ inviteCode }: InviteCodePanelProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setCopyFailed(false);
    } catch {
      setCopyFailed(true);
    }
  }

  return (
    <section aria-labelledby="invite-code-heading">
      <h2
        className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink"
        id="invite-code-heading"
      >
        <span className="h-2 w-2 rounded-full bg-primary" />
        Invite people
      </h2>
      <Card>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blush text-primary-dark">
          <KeyRound aria-hidden="true" className="h-5 w-5" />
        </span>
        <h3 className="mt-5 font-display text-2xl text-ink">Room invite code</h3>
        <p className="mt-2 text-sm leading-6 text-muted">
          Share this code with people you want to invite.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <code className="flex min-h-11 flex-1 items-center rounded-2xl border border-dashed border-soft bg-cream px-4 text-sm font-semibold tracking-wider text-ink">
            {inviteCode}
          </code>
          <Button
            leftIcon={
              copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />
            }
            onClick={() => void copyCode()}
            variant="secondary"
          >
            {copied ? "Copied" : "Copy code"}
          </Button>
        </div>
        <p aria-live="polite" className="mt-2 min-h-5 text-xs text-muted">
          {copyFailed
            ? "Copy failed. Select the code manually."
            : copied
              ? "Invite code copied to clipboard."
              : ""}
        </p>
      </Card>
    </section>
  );
}
