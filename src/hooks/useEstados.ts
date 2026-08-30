import { useQuery } from '@tanstack/react-query';
import { estadoService } from '../services/estadoService';

export function useEstados() {
  return useQuery({
    queryKey: ['estados'],
    queryFn: estadoService.listar,
  });
}
