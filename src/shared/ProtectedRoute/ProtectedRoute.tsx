import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import { isTokenValid } from '../../lib/tokenStorage';

const EXPIRY_CHECK_INTERVAL_MS = 5000;

export function ProtectedRoute() {
  const [valid, setValid] = useState(isTokenValid);

  // isTokenValid() is only re-read on render, so a route left mounted in a
  // background tab past the token's exp would never redirect on its own -
  // this polls so expiry is caught without requiring a navigation.
  useEffect(() => {
    const id = setInterval(() => {
      setValid(isTokenValid());
    }, EXPIRY_CHECK_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  if (!valid) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
