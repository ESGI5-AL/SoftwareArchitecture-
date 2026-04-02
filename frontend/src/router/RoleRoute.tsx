import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";

export function RoleRoute({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Navigate to="/reservation" replace />;
  return <>{children}</>;
}
