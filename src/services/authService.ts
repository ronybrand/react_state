import { httpClient } from '../lib/httpClient';
import { setToken } from '../lib/tokenStorage';
import { LOGIN_PATH } from '../lib/apiPaths';

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
    httpClient.post<LoginResponseDto>(LOGIN_PATH, credentials).then((r) => {
      setToken(r.data.token);
      return r.data;
    }),
};
