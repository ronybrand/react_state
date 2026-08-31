import { Navigate, Outlet } from 'react-router';
import { isTokenValid } from '../../lib/tokenStorage';

export function ProtectedRoute() {
  if (!isTokenValid()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
