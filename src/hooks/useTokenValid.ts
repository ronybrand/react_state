import { useSyncExternalStore } from 'react';
import { isTokenValid } from '../lib/tokenStorage';

const EXPIRY_CHECK_INTERVAL_MS = 5000;

// The token lives in localStorage, which doesn't exist during SSR: reading
// it directly in render makes the server HTML (no token) diverge from the
// first client render (token present) - a hydration mismatch for every
// logged-in page load. useSyncExternalStore uses getServerSnapshot (null =
// "unknown yet") for the server render and the hydration pass, then
// re-renders with the real value, so both agree.
//
// Polling covers expiry while the tab stays mounted (isTokenValid() is a
// pure read of `exp`, no event fires when it passes); the `storage` event
// covers login/logout in another tab.
function subscribe(onChange: () => void): () => void {
  const id = setInterval(onChange, EXPIRY_CHECK_INTERVAL_MS);
  window.addEventListener('storage', onChange);
  return () => {
    clearInterval(id);
    window.removeEventListener('storage', onChange);
  };
}

// null while the value can't be known (server render / hydration).
export function useTokenValid(): boolean | null {
  return useSyncExternalStore<boolean | null>(subscribe, isTokenValid, () => null);
}
