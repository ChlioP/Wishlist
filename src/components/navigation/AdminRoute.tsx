import { useEffect, useState } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";

import { localRepositories } from "@/data/repositories/local";
import { useAuth } from "@/features/auth/AuthContext";
import { canManageRoom } from "@/features/permissions/permissionRules";

export function AdminRoute() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    if (!roomId || !user) {
      setAllowed(false);
      return;
    }

    void Promise.all([
      localRepositories.rooms.getById(roomId),
      localRepositories.rooms.listMembers(roomId),
    ])
      .then(([room, members]) => {
        if (!active) return;
        const membership = members.find((member) => member.userId === user.id);
        setAllowed(
          room ? canManageRoom({ actor: user, membership, room }) : false,
        );
      })
      .catch(() => {
        if (active) setAllowed(false);
      });

    return () => {
      active = false;
    };
  }, [roomId, user]);

  if (allowed === null) {
    return <p className="text-sm text-muted">Checking room permissions…</p>;
  }

  return allowed ? (
    <Outlet />
  ) : (
    <Navigate replace to={roomId ? `/rooms/${roomId}` : "/rooms"} />
  );
}
