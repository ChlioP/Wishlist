import { useState } from "react";
import { Gift, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useModalDialog } from "@/hooks/useModalDialog";

export interface CreateRoomValues {
  description: string;
  name: string;
}

interface CreateRoomDialogProps {
  onClose: () => void;
  onCreate: (values: CreateRoomValues) => Promise<void>;
  open: boolean;
}

export function CreateRoomDialog({
  onClose,
  onCreate,
  open,
}: CreateRoomDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function closeDialog() {
    setName("");
    setDescription("");
    setError("");
    onClose();
  }

  const dialogRef = useModalDialog<HTMLDivElement>(open, closeDialog);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Room name is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onCreate({ description, name });
      setName("");
      setDescription("");
    } catch {
      setError("The room could not be created.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      aria-labelledby="create-room-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-ink/30 px-5 backdrop-blur-[2px]"
      role="dialog"
    >
      <div
        className="w-full max-w-lg rounded-card border border-soft bg-cream shadow-soft"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="flex items-start justify-between gap-4 border-b border-soft bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blush text-primary-dark">
              <Gift aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2
                className="font-display text-2xl text-ink"
                id="create-room-title"
              >
                Create a room
              </h2>
              <p className="mt-1 text-xs text-muted">
                Start a private space for your group.
              </p>
            </div>
          </div>
          <Button
            aria-label="Close create room dialog"
            onClick={closeDialog}
            size="icon"
            variant="ghost"
          >
            <X aria-hidden="true" />
          </Button>
        </header>
        <form className="space-y-5 p-5 sm:p-6" onSubmit={handleSubmit}>
          <Input
            autoFocus
            error={error || undefined}
            label="Room name"
            onChange={(event) => setName(event.target.value)}
            placeholder="Birthday Party"
            value={name}
          />
          <label className="block text-sm font-medium text-ink">
            Description
            <textarea
              className="mt-2 min-h-24 w-full resize-y rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this room for?"
              value={description}
            />
          </label>
          <div className="flex justify-end gap-3 border-t border-soft pt-5">
            <Button onClick={closeDialog} variant="secondary">
              Cancel
            </Button>
            <Button disabled={submitting} type="submit">
              {submitting ? "Creating…" : "Create room"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
