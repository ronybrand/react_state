import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';

export function useLogin() {
  return useMutation({
    mutationFn: authService.login,
  });
}
