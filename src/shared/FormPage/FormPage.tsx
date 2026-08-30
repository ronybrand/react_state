import type { ReactNode } from 'react';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';

interface FormPageProps {
  title: string;
  error: string | null;
  requestId: string | null;
  children: ReactNode;
}

export function FormPage({ title, error, requestId, children }: FormPageProps) {
  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="font-display mb-4 text-xl font-semibold">{title}</h1>
      <ErrorMessage error={error} requestId={requestId} />
      {children}
    </div>
  );
}
