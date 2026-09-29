'use client';

import Link from 'next/link';

// Vite original used react-router's useRouteError() inside an
// errorElement/Component pair on the router config. Next's App Router error
// boundary convention passes `error`/`reset` as props to a special
// error.tsx file instead - this component is kept as a presentational piece
// taking an optional `error` prop so it can be reused from app/error.tsx.
export function RouteError({ error }: { error?: unknown } = {}) {
  if (process.env.NODE_ENV === 'development' && error) {
    console.error(error);
  }

  return (
    <div className="mx-auto max-w-md p-4" role="alert">
      <h1 className="font-display mb-2 text-xl font-semibold">Something went wrong</h1>
      <p className="text-gray-600">
        An unexpected error occurred while loading this page. Try going back to the home page.
      </p>
      <Link href="/" className="text-brand mt-4 inline-block underline">
        Back to home
      </Link>
    </div>
  );
}
