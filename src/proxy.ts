import { NextRequest, NextResponse } from 'next/server';

// Per-request nonce CSP, as documented at
// https://nextjs.org/docs/app/guides/content-security-policy.
//
// Two things have to hold for Next to apply the nonce to its own inline
// bootstrap/RSC-payload <script> tags (self.__next_f.push(...)):
//   1. The CSP header must be on the *request* forwarded to the render, not
//      only on the response - Next parses the nonce out of the request
//      header while rendering. (An earlier version of this file only set the
//      response header, so the inline scripts never got a nonce and were
//      blocked, which broke hydration.)
//   2. The page must be dynamically rendered - a page prerendered at build
//      time has no request, hence no nonce. app/layout.tsx opts the whole
//      app into dynamic rendering for this reason.
//
// 'strict-dynamic' lets the nonced bootstrap scripts load the Turbopack
// chunks they reference, so 'self' is only the fallback for browsers that
// don't understand it. style-src keeps 'unsafe-inline': style injection is a
// much smaller risk than script injection, and Next/React emit inline
// style attributes a nonce can't cover.
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  const csp = [
    "default-src 'self'",
    // React uses eval in development for enhanced error stacks; production doesn't.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
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
    {
      // Only document requests need the CSP: skip the API proxy, static
      // assets, and link prefetches.
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
