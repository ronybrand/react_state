import { useQuery } from '@tanstack/react-query';
import { stateService } from '../services/stateService';

export function useStateById(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['states', id],
    queryFn: () => stateService.get(id),
    enabled: options?.enabled ?? true,
  });
}
