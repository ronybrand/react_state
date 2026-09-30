'use client';

import { useRouter } from 'next/navigation';
import { StateForm } from '../../../../shared/StateForm/StateForm';
import { FormPage } from '../../../../shared/FormPage/FormPage';
import { useErrorMessage } from '../../../../shared/ErrorMessage/useErrorMessage';
import { useCreateState } from '../../../../hooks/useCreateState';
import { useStates } from '../../../../hooks/useStates';
import { extractRequestId } from '../../../../lib/extractRequestId';
import type { NewState } from '../../../../interfaces/state';

export default function CreateState() {
  const router = useRouter();
  const createState = useCreateState();
  const { data: states } = useStates();
  const { error, requestId, setError } = useErrorMessage();

  function handleSubmitState(state: NewState) {
    createState.mutate(state, {
      onSuccess: () => router.push('/'),
      onError: (err) => {
        setError('Failed to create state.', extractRequestId(err));
      },
    });
  }

  return (
    <FormPage title="New state" error={error} requestId={requestId}>
      <StateForm
        disabled={createState.isPending}
        existingAbbreviations={states?.map((state) => state.abbreviation)}
        onSubmitState={handleSubmitState}
      />
    </FormPage>
  );
}
