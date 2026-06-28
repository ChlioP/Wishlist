import { Eye, EyeOff } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { RoomMember } from "@/data/repositories/contracts";
import type { VisibilityGrant } from "@/types/domain";

interface VisibilityMatrixProps {
  grants: VisibilityGrant[];
  members: RoomMember[];
  onToggle: (
    viewerUserId: string,
    wishlistOwnerId: string,
    allowed: boolean,
  ) => Promise<void>;
}

export function VisibilityMatrix({
  grants,
  members,
  onToggle,
}: VisibilityMatrixProps) {
  function isAllowed(viewerUserId: string, ownerUserId: string) {
    return grants.some(
      (grant) =>
        grant.viewerUserId === viewerUserId &&
        grant.wishlistOwnerId === ownerUserId,
    );
  }

  return (
    <section aria-labelledby="visibility-matrix-heading">
      <div>
        <h2
          className="text-sm font-semibold text-ink"
          id="visibility-matrix-heading"
        >
          Member visibility
        </h2>
        <p className="mt-1 text-xs leading-5 text-muted">
          Shared mode uses these grants. Rows are viewers and columns are
          wishlist owners.
        </p>
      </div>
      <Card className="mt-4 overflow-x-auto" padding="none">
        <table className="w-full min-w-[38rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-soft bg-cream/70">
              <th className="px-4 py-3 text-xs font-semibold text-muted">
                Can view
              </th>
              {members.map((owner) => (
                <th
                  className="max-w-32 px-3 py-3 text-center text-xs font-semibold text-ink"
                  key={owner.userId}
                  scope="col"
                >
                  <span className="block truncate">
                    {owner.user.displayName.split(" ")[0]}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-soft">
            {members.map((viewer) => (
              <tr key={viewer.userId}>
                <th
                  className="px-4 py-3 text-xs font-medium text-ink"
                  scope="row"
                >
                  {viewer.user.displayName}
                </th>
                {members.map((owner) => {
                  const isOwn = viewer.userId === owner.userId;
                  const allowed = isOwn || isAllowed(viewer.userId, owner.userId);
                  return (
                    <td className="px-3 py-3 text-center" key={owner.userId}>
                      {isOwn ? (
                        <Badge variant="neutral">Own</Badge>
                      ) : (
                        <button
                          aria-label={`${allowed ? "Hide" : "Show"} ${owner.user.displayName}'s wishlist from ${viewer.user.displayName}`}
                          aria-pressed={allowed}
                          className={`mx-auto grid h-9 w-9 place-items-center rounded-xl transition-colors ${
                            allowed
                              ? "bg-success text-success-foreground"
                              : "bg-cream text-muted hover:bg-blush"
                          }`}
                          onClick={() =>
                            void onToggle(
                              viewer.userId,
                              owner.userId,
                              !allowed,
                            )
                          }
                          type="button"
                        >
                          {allowed ? (
                            <Eye aria-hidden="true" className="h-4 w-4" />
                          ) : (
                            <EyeOff aria-hidden="true" className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
