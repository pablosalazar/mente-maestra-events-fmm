import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "@/components/loader/Loader";
import { type ReactNode } from "react";

interface AuthGuardProps {
  fallback?: string;
  requireAuth?: boolean;
  children?: ReactNode; // Add this line
}

export function AuthGuard({
  fallback = "/register",
  requireAuth = true,
  children, // Add this parameter
}: AuthGuardProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (user === undefined) {
    return (
      <Loader message="Verificando autenticación..." whiteBackground={true} />
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  // If authentication is NOT required but user IS authenticated
  // (useful for login/register pages)
  if (!requireAuth && isAuthenticated) {
    // Redirect to dashboard or home page
    const redirectTo = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  // Render children if provided, otherwise render Outlet
  return children ? <>{children}</> : <Outlet />;
}

// Convenience components for common use cases
export function ProtectedRoute() {
  return <AuthGuard requireAuth={true} />;
}

export function PublicRoute() {
  return <AuthGuard requireAuth={false} />;
}
