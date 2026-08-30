interface ErrorMessageProps {
  error: string | null;
  requestId: string | null;
}

export function ErrorMessage({ error, requestId }: ErrorMessageProps) {
  if (!error) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="border-danger bg-danger/10 text-danger mb-4 rounded border px-4 py-3"
    >
      {error}
      {requestId && <small className="mt-1 block text-gray-500">Reference ID: {requestId}</small>}
    </div>
  );
}
