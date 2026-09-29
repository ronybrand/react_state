import { useQuery } from '@tanstack/react-query';
import { infoService } from '../services/infoService';

// Footer is informational, not critical - if the backend doesn't respond, the
// query just stays errored and the footer section hides, without an alert.
export function useBackendInfo() {
  return useQuery({
    queryKey: ['backendInfo'],
    queryFn: infoService.getBackendInfo,
    retry: false,
  });
}
