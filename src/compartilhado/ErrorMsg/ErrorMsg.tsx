interface ErrorMsgProps {
  error: string | null;
  requestId: string | null;
}

export function ErrorMsg({ error, requestId }: ErrorMsgProps) {
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
      {requestId && (
        <small className="mt-1 block text-gray-500">ID de referência: {requestId}</small>
      )}
    </div>
  );
}
