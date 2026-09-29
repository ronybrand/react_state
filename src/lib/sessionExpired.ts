// A tiny module-level pub/sub, not an importable router singleton: axios's
// response interceptor in httpClient.ts runs outside React (it can't call
// useRouter()), but a client component mounted near the app's root can. That
// component subscribes on mount and does the actual navigation, so a
// session expiring mid-request triggers a normal client-side route change
// instead of httpClient forcing a full page reload via window.location.
type Listener = () => void;

const listeners = new Set<Listener>();

export function onSessionExpired(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifySessionExpired(): void {
  for (const listener of listeners) {
    listener();
  }
}
