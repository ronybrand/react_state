import { useMutation, useQueryClient } from '@tanstack/react-query';
import { estadoService } from '../services/estadoService';

export function useAtualizarEstado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: estadoService.atualizar,
    onSuccess: (estado) => {
      queryClient.invalidateQueries({ queryKey: ['estados'] });
      queryClient.invalidateQueries({ queryKey: ['estados', estado.id] });
    },
  });
}
