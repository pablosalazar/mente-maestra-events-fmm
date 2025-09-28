import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "@/components/loader/Loader";

interface AuthGuardProps {
  fallback?: string;
  requireAuth?: boolean;
}

export function AuthGuard({
  fallback = "/registro",
  requireAuth = true,
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

  return <Outlet />;
}
