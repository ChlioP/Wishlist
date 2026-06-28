import type { PropsWithChildren, ReactNode } from "react";

interface PermissionBoundaryProps extends PropsWithChildren {
  allowed: boolean;
  fallback?: ReactNode;
}

export function PermissionBoundary({
  allowed,
  children,
  fallback = null,
}: PermissionBoundaryProps) {
  return allowed ? children : fallback;
}
