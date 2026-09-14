import { useQuery } from '@tanstack/react-query';
import { stateService } from '../services/stateService';

export function useStates(busca?: string, sort?: string) {
  return useQuery({
    queryKey: ['states', busca, sort],
    queryFn: () => stateService.list(busca, sort),
  });
}
