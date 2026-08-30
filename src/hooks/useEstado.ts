import { useQuery } from '@tanstack/react-query';
import { estadoService } from '../services/estadoService';

export function useEstado(id: number) {
  return useQuery({
    queryKey: ['estados', id],
    queryFn: () => estadoService.buscar(id),
  });
}
