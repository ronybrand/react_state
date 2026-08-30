import { useMutation, useQueryClient } from '@tanstack/react-query';
import { estadoService } from '../services/estadoService';

export function useCriarEstado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: estadoService.criar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['estados'] }),
  });
}
