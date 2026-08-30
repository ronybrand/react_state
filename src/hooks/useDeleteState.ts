import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stateService } from '../services/stateService';

export function useDeleteState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: stateService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['states'] }),
  });
}
