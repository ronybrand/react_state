'use client';

import type { ReactNode } from 'react';
import { ProtectedRoute } from '../../shared/ProtectedRoute/ProtectedRoute';

// Only mutating pages require a token, matching the backend's GET-is-public
// decision (see its ADR 0017) - the list stays outside this route group.
// This route group layout is the App Router equivalent of the Vite
// original's <ProtectedRoute/> layout route wrapping /state/new and
// /state/:id/edit in react-router.
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
