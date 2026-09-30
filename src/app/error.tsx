'use client';

import { RouteError } from '../shared/RouteError/RouteError';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return <RouteError error={error} />;
}
