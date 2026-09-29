import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stateService } from '../services/stateService';

export function useUpdateState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: stateService.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['states'] }),
  });
}
