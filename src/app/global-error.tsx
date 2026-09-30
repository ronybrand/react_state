'use client';

import './globals.css';
import { RouteError } from '../shared/RouteError/RouteError';

// Catches errors thrown by the root layout itself (or its providers), which
// app/error.tsx can't - that boundary sits below the layout. Because this
// replaces the root layout when it renders, it has to supply its own
// <html>/<body>.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <RouteError error={error} />
      </body>
    </html>
  );
}
