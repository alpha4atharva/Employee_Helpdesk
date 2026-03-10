/**
 * ProtectedRoute.tsx - Route guard component.
 * Redirects unauthenticated users to login.
 * Optionally restricts access by role.
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { UserRole } from "../types/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Show nothing while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-lg">Loading...</div>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role → redirect to their correct dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "EMPLOYEE") return <Navigate to="/employee-dashboard" replace />;
    if (user.role === "IT_AGENT") return <Navigate to="/it-dashboard" replace />;
    if (user.role === "ADMIN") return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
