import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Pins Turbopack's workspace root to this project's own directory - it
  // otherwise walks up looking for a lockfile and can pick up a sibling
  // project's instead when this repo sits under a parent directory that
  // contains several unrelated npm projects (as it does here).
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Ported from the removed vercel.json's `headers` block (Vercel picks up
  // headers() from next.config.ts natively - no vercel.json needed for
  // this, matching the plan's "Vercel native, zero-config" deploy step).
  // The old rewrites in that file don't carry over: the SPA fallback
  // rewrite (`/(.*) -> /index.html`) is now just how Next's App Router
  // works, and the `/api/(.*)` -> backend rewrite is superseded by
  // src/app/api/[...path]/route.ts, a full catch-all proxy to the backend.
  //
  // Content-Security-Policy is NOT set here - a static `script-src 'self'`
  // (the literal port of the old CSP) blocks the App Router's own inline
  // RSC-payload scripts and breaks hydration. See src/proxy.ts, which sets
  // a CSP allowing 'unsafe-inline' scripts instead (the nonce approach
  // didn't work in CI - the reasoning is documented there).
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
