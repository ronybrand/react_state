'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTokenValid } from '../../hooks/useTokenValid';

// Vite original rendered <Navigate/> + <Outlet/> as a react-router layout
// route. Next's App Router has no equivalent of nested route wrapping for
// a subset of pages via a component, so this takes `children` instead and
// is used either directly in a protected page or from a route-group layout
// (see app/(protected)/layout.tsx).
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  // null = token state not known yet (server render / hydration): render
  // nothing and, crucially, don't redirect - only a definite `false` does.
  // useTokenValid also polls, so a route left mounted in a background tab
  // past the token's exp still redirects without requiring a navigation.
  const valid = useTokenValid();

  useEffect(() => {
    if (valid === false) {
      router.replace('/login');
    }
  }, [valid, router]);

  if (!valid) {
    return null;
  }

  return children;
}
