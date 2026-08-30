import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stateService } from '../services/stateService';

export function useUpdateState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: stateService.update,
    onSuccess: (state) => {
      queryClient.invalidateQueries({ queryKey: ['states'] });
      queryClient.invalidateQueries({ queryKey: ['states', state.id] });
    },
  });
}
