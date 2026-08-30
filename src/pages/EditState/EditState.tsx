import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { StateForm } from '../../shared/StateForm/StateForm';
import { FormPage } from '../../shared/FormPage/FormPage';
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
  const { error, requestId, setError, clearError } = useErrorMessage();

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
        onSuccess: () => navigate('/'),
        onError: (err) => {
          setError(extractErrorMessage(err, 'Failed to update state.'), extractRequestId(err));
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
          onSubmitState={handleSubmitState}
        />
      )}
    </FormPage>
  );
}
