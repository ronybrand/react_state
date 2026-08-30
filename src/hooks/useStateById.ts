import { useQuery } from '@tanstack/react-query';
import { estadoService } from '../services/estadoService';

export function useEstado(id: number, opcoes?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['estados', id],
    queryFn: () => estadoService.buscar(id),
    enabled: opcoes?.enabled ?? true,
  });
}
