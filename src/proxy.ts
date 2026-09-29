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
  // Turbopack/React's dev-mode HMR and debugging use eval() - never in a
  // production build, so this only loosens script-src outside prod.
  const scriptSrc =
    process.env.NODE_ENV === 'development'
      ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
      : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;
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
