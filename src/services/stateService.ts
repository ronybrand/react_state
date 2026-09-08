import { httpClient } from '../lib/httpClient';
import type { NewState, State } from '../interfaces/state';
import {
  toNewStateApiDto,
  toState,
  toUpdateStateApiDto,
  type PageApiDto,
  type StateApiDto,
} from './stateApiMapper';

// Matches the backend's actual REST contract (/estado) - not translated,
// since renaming it here would break real API calls.
const BASE_URL = '/estado';

export const stateService = {
  // size=100 covers the whole dataset (27 Brazilian states) in a single
  // page - the backend removed the unpaginated GET /estado (ADR 0018),
  // /paginado is now the only listing endpoint.
  list: () =>
    httpClient
      .get<PageApiDto<StateApiDto>>(`${BASE_URL}/paginado`, { params: { size: 100 } })
      .then((r) => r.data.content.map(toState)),

  get: (id: number) =>
    httpClient.get<StateApiDto>(`${BASE_URL}/${id}`).then((r) => toState(r.data)),

  create: (state: NewState) =>
    httpClient
      .post<StateApiDto>(`${BASE_URL}/`, toNewStateApiDto(state))
      .then((r) => toState(r.data)),

  update: (state: State) =>
    httpClient
      .put<StateApiDto>(`${BASE_URL}/${state.id}`, toUpdateStateApiDto(state))
      .then((r) => toState(r.data)),

  delete: (id: number) => httpClient.delete<void>(`${BASE_URL}/${id}`).then(() => undefined),
};
