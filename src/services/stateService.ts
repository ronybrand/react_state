import { httpClient } from '../lib/httpClient';
import type { Estado } from '../interfaces/estado';

const BASE_URL = '/estado';

export type NovoEstado = Pick<Estado, 'nome' | 'sigla'>;

export const estadoService = {
  listar: () => httpClient.get<Estado[]>(`${BASE_URL}/`).then((r) => r.data),

  buscar: (id: number) => httpClient.get<Estado>(`${BASE_URL}/${id}`).then((r) => r.data),

  criar: (estado: NovoEstado) =>
    httpClient.post<Estado>(`${BASE_URL}/`, estado).then((r) => r.data),

  atualizar: (estado: Estado) => httpClient.put<Estado>(`${BASE_URL}/`, estado).then((r) => r.data),

  excluir: (id: number) => httpClient.delete<void>(`${BASE_URL}/${id}`).then(() => undefined),
};
