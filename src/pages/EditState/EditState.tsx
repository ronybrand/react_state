import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { StateForm } from '../../shared/StateForm/StateForm';
import { ErrorMessage } from '../../shared/ErrorMessage/ErrorMessage';
import { useErrorMessage } from '../../shared/ErrorMessage/useErrorMessage';
import { Spinner } from '../../shared/Spinner/Spinner';
import { useStateById } from '../../hooks/useStateById';
import { useUpdateState } from '../../hooks/useUpdateState';
import { extractErrorMessage } from '../../lib/extractErrorMessage';
import { extractRequestId } from '../../lib/extractRequestId';
import type { NewState } from '../../interfaces/state';

export function EditState() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const stateId = Number(id);
  const validId = id !== undefined && Number.isInteger(stateId) && stateId > 0;

  const {
    data: state,
    isLoading,
    isError,
    error: loadError,
  } = useStateById(stateId, { enabled: validId });
  const updateState = useUpdateState();
  const { error, requestId, setError } = useErrorMessage();

  useEffect(() => {
    if (!validId) {
      setError('Invalid state.');
      return;
    }
    if (isError) {
      setError(
        extractErrorMessage(loadError, 'Failed to fetch state.'),
        extractRequestId(loadError),
      );
    }
  }, [validId, isError, loadError, setError]);

  function handleSubmitState(data: NewState) {
    if (!state) {
      return;
    }
    updateState.mutate(
      { ...state, ...data },
      {
        onSuccess: () => navigate('/'),
        onError: (err) => {
          setError(extractErrorMessage(err, 'Failed to update state.'), extractRequestId(err));
        },
      },
    );
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="font-display mb-4 text-xl font-semibold">Edit state</h1>
      <ErrorMessage error={error} requestId={requestId} />
      {validId && isLoading && <Spinner />}
      {state && (
        <StateForm
          initialValues={{ abbreviation: state.abbreviation, name: state.name }}
          disabled={updateState.isPending}
          onSubmitState={handleSubmitState}
        />
      )}
    </div>
  );
}
