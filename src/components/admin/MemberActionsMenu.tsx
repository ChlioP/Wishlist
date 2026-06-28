import { MoreHorizontal, UserMinus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";

interface MemberActionsMenuProps {
  disabled?: boolean;
  memberName: string;
  onRemove: () => Promise<void>;
}

export function MemberActionsMenu({
  disabled = false,
  memberName,
  onRemove,
}: MemberActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeMenu(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (disabled) return null;

  return (
    <div className="relative" ref={menuRef}>
      <Button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Actions for ${memberName}`}
        onClick={() => setOpen((current) => !current)}
        size="icon"
        variant="ghost"
      >
        <MoreHorizontal aria-hidden="true" />
      </Button>
      {open ? (
        <div
          className="absolute right-0 top-11 z-20 w-44 rounded-2xl border border-soft bg-white p-1.5 shadow-soft"
          role="menu"
        >
          <button
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-red-700 hover:bg-red-50"
            onClick={() => {
              setOpen(false);
              void onRemove();
            }}
            role="menuitem"
            type="button"
          >
            <UserMinus aria-hidden="true" className="h-4 w-4" />
            Remove member
          </button>
        </div>
      ) : null}
    </div>
  );
}
