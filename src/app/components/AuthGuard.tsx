import { Outlet, Navigate } from "react-router";
import { useAuthContext } from "@/contexts/AuthContext";
import { PageLoader } from "./PageLoader";
import type { UserRole } from "@/types/database.types";

interface AuthGuardProps {
  allowedRoles?: UserRole[];
}

export function AuthGuard({ allowedRoles }: AuthGuardProps) {
  const { isAuthenticated, role, isLoading } = useAuthContext();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}
