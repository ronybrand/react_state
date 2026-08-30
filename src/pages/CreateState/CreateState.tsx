import { useNavigate } from 'react-router';
import { StateForm } from '../../shared/StateForm/StateForm';
import { FormPage } from '../../shared/FormPage/FormPage';
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
    <FormPage title="New state" error={error} requestId={requestId}>
      <StateForm disabled={createState.isPending} onSubmitState={handleSubmitState} />
    </FormPage>
  );
}
