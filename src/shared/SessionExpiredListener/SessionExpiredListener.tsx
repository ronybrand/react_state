'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onSessionExpired } from '../../lib/sessionExpired';

// Mounted once near the app's root (see providers.tsx). httpClient's 401
// interceptor can't call useRouter() itself (it runs outside React), so it
// notifies this component instead, which does the actual client-side
// navigation - see the comment in httpClient.ts.
export function SessionExpiredListener() {
  const router = useRouter();

  useEffect(() => {
    return onSessionExpired(() => {
      router.replace('/login');
    });
  }, [router]);

  return null;
}
