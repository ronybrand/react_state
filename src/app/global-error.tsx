'use client';

import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../messages/en.json';
import { RouteError } from '../shared/RouteError/RouteError';

// Catches errors thrown by the root layout itself (or its providers), which
// app/error.tsx can't - that boundary sits below the layout. Because this
// replaces the root layout when it renders, it has to supply its own
// <html>/<body>.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider locale="en" messages={messages}>
          <RouteError error={error} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
