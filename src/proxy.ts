import { NextResponse } from 'next/server';

// The App Router injects its own inline bootstrap/RSC-payload <script> tags
// (self.__next_f.push(...)) - a static `script-src 'self'` CSP (the direct
// port of the old Vite app's vercel.json headers) blocks those and breaks
// hydration entirely (Next throws "Invariant: Expected a request ID to be
// defined for the document via self.__next_r").
//
// Next's documented fix is a per-request nonce, echoed back in the CSP
// header so Next can apply it to its own inline scripts automatically -
// tried first, along with a 'strict-dynamic' variant. Both reproducibly
// broke hydration specifically in the Playwright container CI's e2e job
// runs in (~14/52 tests passing, forms never becoming interactive - e.g.
// the login button staying permanently disabled) while passing 52/52 on
// every other browser/machine this was tested on, including a local
// reproduction of that same container image. Adding 'unsafe-inline'
// alongside the nonce as a fallback didn't help either: per the CSP3 spec,
// a browser that understands `nonce-` ignores 'unsafe-inline' whenever a
// nonce is present at all, matching or not - so if that container's
// browser build has a nonce-matching bug rather than simply not supporting
// nonces, the fallback would have been silently ignored, same as no
// fallback. The exact engine-level cause was never isolated (see PR #56
// discussion) - removing the CSP outright, as a diagnostic, was the only
// change that made that job go green.
//
// So there's no nonce here. `script-src 'self' 'unsafe-inline'` is the
// fallback that's actually reachable regardless of nonce support/bugs:
// 'self' covers every same-origin <script src> chunk Turbopack emits, and
// 'unsafe-inline' allows the inline RSC-payload scripts 'self' can't match
// by origin. Known, accepted trade-off: this app no longer restricts
// *which* inline scripts run, only that scripts loaded from other origins
// don't - see https://nextjs.org/docs/app/guides/content-security-policy
// if a future engine-specific fix for the nonce approach is worth
// revisiting.
export function proxy() {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    // Skip static assets - only document/route requests need the CSP.
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
