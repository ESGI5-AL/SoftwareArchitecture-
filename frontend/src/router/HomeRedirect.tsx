import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";

export function HomeRedirect() {
  const { user } = useAuth();
  if (user?.role === "manager" || user?.role === "secretary") {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/reservation" replace />;
}
