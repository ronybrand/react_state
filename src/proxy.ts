import { NextResponse, type NextRequest } from 'next/server';

// The App Router injects its own inline bootstrap/RSC-payload <script> tags
// (self.__next_f.push(...)) - a static `script-src 'self'` CSP (the direct
// port of the old Vite app's vercel.json headers) blocks those and breaks
// hydration entirely (Next throws "Invariant: Expected a request ID to be
// defined for the document via self.__next_r"). Next's documented fix is a
// per-request nonce set here and echoed back in the CSP header; Next then
// automatically nonces its own inline scripts when it sees the nonce on the
// request, no manual wiring needed in layout.tsx.
// https://nextjs.org/docs/app/guides/content-security-policy
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  // No 'strict-dynamic': this app has no external/CDN scripts, so 'self'
  // already covers every same-origin <script src> chunk Turbopack emits
  // (including ones loaded dynamically at runtime, since 'self' matches by
  // origin, not by how the tag was inserted) - the nonce is only needed for
  // the inline RSC-payload <script> tags 'self' can't match. 'strict-dynamic'
  // was tried first (Next's own CSP guide leads with it) but reproducibly
  // broke hydration in the Playwright container CI's e2e job runs in
  // (confirmed by removing the whole CSP as a diagnostic - e2e went green):
  // some interaction between it and how that specific Chromium/Firefox
  // build there propagates trust to Turbopack's dynamically-loaded chunks.
  // Plain 'self' + nonce sidesteps that; every e2e page still needs is a
  // same-origin script tag or an inline nonce'd one, never something that
  // actually required strict-dynamic's dynamic-trust-propagation semantics.
  const scriptSrc =
    process.env.NODE_ENV === 'development'
      ? `script-src 'self' 'nonce-${nonce}' 'unsafe-eval'`
      : `script-src 'self' 'nonce-${nonce}'`;
  const csp = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    // Skip static assets - only document/route requests need the CSP+nonce.
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
