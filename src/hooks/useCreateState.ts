import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stateService } from '../services/stateService';

export function useCreateState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: stateService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['states'] }),
  });
}
