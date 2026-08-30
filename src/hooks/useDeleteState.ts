import { useMutation, useQueryClient } from '@tanstack/react-query';
import { estadoService } from '../services/estadoService';

export function useExcluirEstado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: estadoService.excluir,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['estados'] }),
  });
}
