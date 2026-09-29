'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { isTokenValid } from '../../lib/tokenStorage';

const EXPIRY_CHECK_INTERVAL_MS = 5000;

// Vite original rendered <Navigate/> + <Outlet/> as a react-router layout
// route. Next's App Router has no equivalent of nested route wrapping for
// a subset of pages via a component, so this takes `children` instead and
// is used either directly in a protected page or from a route-group layout
// (see app/(protected)/layout.tsx).
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
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

  useEffect(() => {
    if (!valid) {
      router.replace('/login');
    }
  }, [valid, router]);

  if (!valid) {
    return null;
  }

  return children;
}
