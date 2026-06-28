import type { RoomRole } from "@/types/domain";

interface RoleSelectorProps {
  disabled?: boolean;
  onChange: (role: Extract<RoomRole, "admin" | "member">) => Promise<void>;
  value: RoomRole;
}

export function RoleSelector({
  disabled = false,
  onChange,
  value,
}: RoleSelectorProps) {
  if (value === "owner") {
    return (
      <span className="text-xs font-semibold text-purple-foreground">
        Owner
      </span>
    );
  }

  return (
    <label>
      <span className="sr-only">Member role</span>
      <select
        className="min-h-9 rounded-xl border border-black/10 bg-white px-3 text-xs text-ink disabled:cursor-not-allowed disabled:bg-cream disabled:text-muted"
        disabled={disabled}
        onChange={(event) =>
          void onChange(event.target.value as "admin" | "member")
        }
        value={value}
      >
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>
    </label>
  );
}
