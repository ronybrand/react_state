import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

// Nonce-based CSP (see src/proxy.ts) only works on dynamically rendered
// pages: a page prerendered at build time has no request to take a nonce
// from, so its inline scripts would be blocked. Set here on the root layout
// so it covers every route.
export const dynamic = 'force-dynamic';

const title = 'Brazilian States — React/Next.js Frontend';
const description =
  'Alternate React/Next.js frontend for a production Java/Spring Boot REST API, with a BFF route handler forwarding real visitor IPs through Vercel to preserve per-client rate limiting behind the proxy.';
const siteUrl = 'https://react-state-flax.vercel.app/';

export const metadata: Metadata = {
  title,
  description,
  authors: [{ name: 'Rony Reinehr Brand' }],
  openGraph: {
    type: 'website',
    title,
    description,
    url: siteUrl,
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
