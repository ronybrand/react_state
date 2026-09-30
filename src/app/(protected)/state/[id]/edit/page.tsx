'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { StateForm } from '../../../../../shared/StateForm/StateForm';
import { FormPage } from '../../../../../shared/FormPage/FormPage';
import { useErrorMessage } from '../../../../../shared/ErrorMessage/useErrorMessage';
import { Spinner } from '../../../../../shared/Spinner/Spinner';
import { useStateById } from '../../../../../hooks/useStateById';
import { useStates } from '../../../../../hooks/useStates';
import { useUpdateState } from '../../../../../hooks/useUpdateState';
import { extractRequestId } from '../../../../../lib/extractRequestId';
import type { NewState } from '../../../../../interfaces/state';

// Client Component, so `useParams()` from next/navigation is used instead
// of the route's `params` prop (which in Next 15+ App Router is a Promise
// meant for Server Components).
export default function EditState() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const stateId = Number(id);
  const validId = id !== undefined && Number.isInteger(stateId) && stateId > 0;

  const {
    data: state,
    isLoading,
    isError,
    error: loadError,
  } = useStateById(stateId, { enabled: validId });
  const updateState = useUpdateState();
  const { data: states } = useStates();
  const { error, requestId, setError, clearError } = useErrorMessage();

  useEffect(() => {
    if (!validId) {
      setError('Invalid state.');
      return;
    }
    if (isError) {
      setError('Failed to fetch state.', extractRequestId(loadError));
      return;
    }
    clearError();
  }, [validId, isError, loadError, setError, clearError]);

  function handleSubmitState(data: NewState) {
    if (!state) {
      return;
    }
    updateState.mutate(
      { ...state, ...data },
      {
        onSuccess: () => router.push('/'),
        onError: (err) => {
          setError('Failed to update state.', extractRequestId(err));
        },
      },
    );
  }

  return (
    <FormPage title="Edit state" error={error} requestId={requestId}>
      {validId && isLoading && <Spinner />}
      {state && (
        <StateForm
          initialValues={{ abbreviation: state.abbreviation, name: state.name }}
          disabled={updateState.isPending}
          existingAbbreviations={states?.map((s) => s.abbreviation)}
          onSubmitState={handleSubmitState}
        />
      )}
    </FormPage>
  );
}
