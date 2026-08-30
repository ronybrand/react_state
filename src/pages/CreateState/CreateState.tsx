import { useNavigate } from 'react-router';
import { StateForm } from '../../shared/StateForm/StateForm';
import { ErrorMessage } from '../../shared/ErrorMessage/ErrorMessage';
import { useErrorMessage } from '../../shared/ErrorMessage/useErrorMessage';
import { useCreateState } from '../../hooks/useCreateState';
import { extractErrorMessage } from '../../lib/extractErrorMessage';
import { extractRequestId } from '../../lib/extractRequestId';
import type { NewState } from '../../interfaces/state';

export function CreateState() {
  const navigate = useNavigate();
  const createState = useCreateState();
  const { error, requestId, setError } = useErrorMessage();

  function handleSubmitState(state: NewState) {
    createState.mutate(state, {
      onSuccess: () => navigate('/'),
      onError: (err) => {
        setError(extractErrorMessage(err, 'Failed to create state.'), extractRequestId(err));
      },
    });
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="font-display mb-4 text-xl font-semibold">New state</h1>
      <ErrorMessage error={error} requestId={requestId} />
      <StateForm disabled={createState.isPending} onSubmitState={handleSubmitState} />
    </div>
  );
}
