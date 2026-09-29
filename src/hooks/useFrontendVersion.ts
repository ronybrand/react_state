import { useQuery } from '@tanstack/react-query';
import { infoService } from '../services/infoService';

// Footer is informational, not critical - if version.json is missing (e.g. local
// dev without a build), the query just stays errored and the footer section hides.
export function useFrontendVersion() {
  return useQuery({
    queryKey: ['frontendVersion'],
    queryFn: infoService.getFrontendVersion,
    retry: false,
  });
}
