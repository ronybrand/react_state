import { useQuery } from '@tanstack/react-query';
import { stateService } from '../services/stateService';

export function useStates() {
  return useQuery({
    queryKey: ['states'],
    queryFn: stateService.list,
  });
}
