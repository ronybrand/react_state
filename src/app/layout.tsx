import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

// Nonce-based CSP (see src/proxy.ts) only works on dynamically rendered
// pages: a page prerendered at build time has no request to take a nonce
// from, so its inline scripts would be blocked. Set here on the root layout
// so it covers every route.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'State CRUD - React/Java',
  description: 'React + Next.js state CRUD frontend',
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
