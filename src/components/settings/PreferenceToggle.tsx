import { cn } from "@/lib/classes";

interface PreferenceToggleProps {
  checked: boolean;
  description: string;
  label: string;
  onChange: (checked: boolean) => void;
}

export function PreferenceToggle({
  checked,
  description,
  label,
  onChange,
}: PreferenceToggleProps) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-5 py-4">
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-muted">
          {description}
        </span>
      </span>
      <input
        checked={checked}
        className="peer sr-only"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span
        aria-hidden="true"
        className={cn(
          "relative mt-0.5 h-7 w-12 shrink-0 rounded-full border transition-colors",
          "after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform",
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary",
          checked
            ? "border-primary bg-primary after:translate-x-5"
            : "border-black/10 bg-cream",
        )}
      />
    </label>
  );
}
