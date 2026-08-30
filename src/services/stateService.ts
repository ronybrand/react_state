import { httpClient } from '../lib/httpClient';
import type { NewState, State } from '../interfaces/state';
import { toNewStateApiDto, toState, toStateApiDto, type StateApiDto } from './stateApiMapper';

// Matches the backend's actual REST contract (/estado) - not translated,
// since renaming it here would break real API calls.
const BASE_URL = '/estado';

export const stateService = {
  list: () => httpClient.get<StateApiDto[]>(`${BASE_URL}/`).then((r) => r.data.map(toState)),

  get: (id: number) =>
    httpClient.get<StateApiDto>(`${BASE_URL}/${id}`).then((r) => toState(r.data)),

  create: (state: NewState) =>
    httpClient
      .post<StateApiDto>(`${BASE_URL}/`, toNewStateApiDto(state))
      .then((r) => toState(r.data)),

  update: (state: State) =>
    httpClient.put<StateApiDto>(`${BASE_URL}/`, toStateApiDto(state)).then((r) => toState(r.data)),

  delete: (id: number) => httpClient.delete<void>(`${BASE_URL}/${id}`).then(() => undefined),
};
