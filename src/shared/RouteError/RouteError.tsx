import { Link, useRouteError } from 'react-router';

export function RouteError() {
  const error = useRouteError();

  if (import.meta.env.DEV) {
    console.error(error);
  }

  return (
    <div className="mx-auto max-w-md p-4" role="alert">
      <h1 className="font-display mb-2 text-xl font-semibold">Something went wrong</h1>
      <p className="text-gray-600">
        An unexpected error occurred while loading this page. Try going back to the home page.
      </p>
      <Link to="/" className="text-brand mt-4 inline-block underline">
        Back to home
      </Link>
    </div>
  );
}
