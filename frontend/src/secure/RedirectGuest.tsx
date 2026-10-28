import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

export function RedirectGuest() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const requestedPath = (
    location.state as { from?: string } | null
  )?.from;

  if (isAuthenticated) {
    return <Navigate to={requestedPath || "/"} replace />;
  }

  return <Outlet />;
}
