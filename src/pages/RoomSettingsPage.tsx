import { useCallback, useEffect, useMemo, useState } from "react";
import { ShieldCheck, UsersRound } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { AdminActivityLog } from "@/components/admin/AdminActivityLog";
import { DangerZone } from "@/components/admin/DangerZone";
import { JoinRequestList } from "@/components/admin/JoinRequestList";
import { MemberActionsMenu } from "@/components/admin/MemberActionsMenu";
import { PrivacyModeSelector } from "@/components/admin/PrivacyModeSelector";
import { RoleSelector } from "@/components/admin/RoleSelector";
import { VisibilityMatrix } from "@/components/admin/VisibilityMatrix";
import { PermissionBoundary } from "@/components/navigation/PermissionBoundary";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { RoomMember } from "@/data/repositories/contracts";
import { RepositoryError } from "@/data/repositories/errors";
import { localRepositories } from "@/data/repositories/local";
import { useAuth } from "@/features/auth/AuthContext";
import { canManageRoom } from "@/features/permissions/permissionRules";
import type {
  ActivityEvent,
  JoinRequest,
  Room,
  RoomPrivacyMode,
  VisibilityGrant,
} from "@/types/domain";

interface SettingsData {
  activity: ActivityEvent[];
  grants: VisibilityGrant[];
  joinRequests: JoinRequest[];
  members: RoomMember[];
  room: Room;
}

export function RoomSettingsPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSettings = useCallback(async () => {
    if (!roomId) return;
    const [room, members, grants, joinRequests, activity] = await Promise.all([
      localRepositories.rooms.getById(roomId),
      localRepositories.rooms.listMembers(roomId),
      localRepositories.rooms.listVisibilityGrants(roomId),
      localRepositories.rooms.listJoinRequests(roomId),
      localRepositories.activity.listForRoom(roomId),
    ]);
    if (!room) throw new Error("Room not found.");
    setData({ activity, grants, joinRequests, members, room });
  }, [roomId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void loadSettings()
      .catch(() => {
        if (active) setError("Room settings could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadSettings]);

  const currentMembership = data?.members.find(
    (member) => member.userId === user?.id,
  );
  const allowed = Boolean(
    data &&
      user &&
      canManageRoom({
        actor: user,
        membership: currentMembership,
        room: data.room,
      }),
  );
  const canManageRoles = currentMembership?.role === "owner";

  async function logAction(
    action: ActivityEvent["action"],
    metadata: ActivityEvent["metadata"],
  ) {
    if (!user || !roomId) return;
    try {
      await localRepositories.activity.append({
        action,
        actorUserId: user.id,
        metadata,
        roomId,
      });
    } catch {
      // Activity writes are optional until their Firebase write phase.
    }
  }

  async function changePrivacy(privacyMode: RoomPrivacyMode) {
    if (!roomId) return;
    if (privacyMode === data?.room.privacyMode) return;
    setError("");
    try {
      await localRepositories.rooms.setPrivacyMode(roomId, privacyMode);
      await logAction("room_updated", { privacyMode });
      await loadSettings();
    } catch (caught) {
      setError(
        repositoryErrorMessage(
          caught,
          "Privacy mode could not be updated.",
        ),
      );
    }
  }

  async function deleteRoom() {
    if (!roomId) return;
    setError("");
    try {
      await localRepositories.rooms.deleteRoom(roomId);
      navigate("/rooms", { replace: true });
    } catch (caught) {
      setError(
        repositoryErrorMessage(caught, "The room could not be deleted."),
      );
    }
  }

  async function toggleVisibility(
    viewerUserId: string,
    wishlistOwnerId: string,
    visible: boolean,
  ) {
    if (!roomId || !user) return;
    setError("");
    try {
      await localRepositories.rooms.setVisibilityGrant({
        allowed: visible,
        grantedByUserId: user.id,
        roomId,
        viewerUserId,
        wishlistOwnerId,
      });
      await logAction("visibility_changed", {
        visible,
        viewerUserId,
        wishlistOwnerId,
      });
      await loadSettings();
    } catch {
      setError("Visibility permission could not be updated.");
    }
  }

  async function changeRole(userId: string, role: "admin" | "member") {
    if (!roomId) return;
    setError("");
    try {
      await localRepositories.rooms.changeRole(roomId, userId, role);
      await logAction("role_changed", { role, userId });
      await loadSettings();
    } catch {
      setError("Member role could not be updated.");
    }
  }

  async function removeMember(userId: string) {
    if (!roomId) return;
    setError("");
    try {
      await localRepositories.rooms.removeMember(roomId, userId);
      await logAction("member_removed", { userId });
      await loadSettings();
    } catch {
      setError("The member could not be removed.");
    }
  }

  async function reviewRequest(
    requestId: string,
    decision: "approved" | "rejected",
  ) {
    setError("");
    try {
      const request = await localRepositories.rooms.reviewJoinRequest(
        requestId,
        decision,
      );
      if (decision === "approved") {
        await logAction("member_added", { userId: request.userId });
      }
      await loadSettings();
    } catch {
      setError("The join request could not be updated.");
    }
  }

  if (loading) {
    return <SettingsLoadingState />;
  }

  if (error && !data) {
    return <SettingsError message={error} />;
  }

  if (!data || !user) {
    return <SettingsError message="Room settings are unavailable." />;
  }

  return (
    <PermissionBoundary
      allowed={allowed}
      fallback={
        <SettingsError message="Administrator permission is required." />
      }
    >
      <div className="space-y-6">
        <header>
          <Link
            className="text-sm font-medium text-muted hover:text-ink"
            to={`/rooms/${data.room.id}`}
          >
            ← Back to {data.room.name}
          </Link>
          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl text-ink sm:text-4xl">
                  Room settings
                </h1>
                <Badge
                  icon={<ShieldCheck aria-hidden="true" />}
                  variant="purple"
                >
                  Admin
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted">
                Manage privacy and membership for {data.room.name}.
              </p>
            </div>
          </div>
        </header>

        {error ? (
          <div
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <Card>
          <PrivacyModeSelector
            onChange={changePrivacy}
            value={data.room.privacyMode}
          />
        </Card>

        <MemberManagement
          canManageRoles={canManageRoles}
          currentUserId={user.id}
          members={data.members}
          onRemove={removeMember}
          onRoleChange={changeRole}
        />

        <VisibilityMatrix
          grants={data.grants}
          members={data.members}
          onToggle={toggleVisibility}
        />

        <div className="grid items-start gap-6 xl:grid-cols-2">
          <JoinRequestList
            onReview={reviewRequest}
            requests={data.joinRequests}
          />
          <AdminActivityLog events={data.activity} />
        </div>

        <DangerZone
          canDelete={allowed}
          onDelete={deleteRoom}
          roomName={data.room.name}
        />
      </div>
    </PermissionBoundary>
  );
}

function repositoryErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof RepositoryError ? error.message : fallback;
}

interface MemberManagementProps {
  canManageRoles: boolean;
  currentUserId: string;
  members: RoomMember[];
  onRemove: (userId: string) => Promise<void>;
  onRoleChange: (
    userId: string,
    role: "admin" | "member",
  ) => Promise<void>;
}

function MemberManagement({
  canManageRoles,
  currentUserId,
  members,
  onRemove,
  onRoleChange,
}: MemberManagementProps) {
  const sortedMembers = useMemo(
    () =>
      [...members].sort((left, right) => {
        const rank = { owner: 0, admin: 1, member: 2 };
        return rank[left.role] - rank[right.role];
      }),
    [members],
  );

  return (
    <section aria-labelledby="member-management-heading">
      <h2
        className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink"
        id="member-management-heading"
      >
        <UsersRound aria-hidden="true" className="h-4 w-4 text-primary-dark" />
        Member management
      </h2>
      <Card padding="none">
        <div className="divide-y divide-soft">
          {sortedMembers.map((member) => {
            const isSelf = member.userId === currentUserId;
            const canRemove =
              !isSelf &&
              member.role !== "owner" &&
              (canManageRoles || member.role === "member");
            return (
              <div
                className="flex flex-wrap items-center gap-3 px-5 py-4"
                key={member.id}
              >
                <Avatar
                  alt={member.user.displayName}
                  src={member.user.avatarUrl}
                />
                <div className="min-w-40 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {member.user.displayName}
                    {isSelf ? " (You)" : ""}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {member.user.email}
                  </p>
                </div>
                <RoleSelector
                  disabled={!canManageRoles || isSelf}
                  onChange={(role) => onRoleChange(member.userId, role)}
                  value={member.role}
                />
                <MemberActionsMenu
                  disabled={!canRemove}
                  memberName={member.user.displayName}
                  onRemove={() => onRemove(member.userId)}
                />
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}

function SettingsLoadingState() {
  return (
    <div aria-live="polite" className="space-y-5" role="status">
      <span className="sr-only">Loading room settings.</span>
      {[0, 1, 2].map((item) => (
        <Card className="motion-safe:animate-pulse" key={item}>
          <div className="h-5 w-48 rounded-full bg-blush" />
          <div className="mt-5 h-24 rounded-2xl bg-cream" />
        </Card>
      ))}
    </div>
  );
}

function SettingsError({ message }: { message: string }) {
  return (
    <Card className="text-center">
      <h1 className="font-display text-2xl text-ink">Settings unavailable</h1>
      <p className="mt-2 text-sm text-muted">{message}</p>
      <Link
        className="mt-5 inline-block text-sm font-medium text-primary-dark hover:underline"
        to="/rooms"
      >
        Return to rooms
      </Link>
    </Card>
  );
}
