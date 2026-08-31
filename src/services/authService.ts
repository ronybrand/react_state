import { httpClient } from '../lib/httpClient';
import { setToken } from '../lib/tokenStorage';

const BASE_URL = '/auth';

export interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponseDto {
  token: string;
  expiresInSeconds: number;
}

export const authService = {
  login: (credentials: LoginCredentials) =>
    httpClient.post<LoginResponseDto>(`${BASE_URL}/login`, credentials).then((r) => {
      setToken(r.data.token);
      return r.data;
    }),
};
