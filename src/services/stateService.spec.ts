import MockAdapter from 'axios-mock-adapter';
import { httpClient } from '../lib/httpClient';
import { stateService } from './stateService';
import type { State } from '../interfaces/state';
import type { StateApiDto } from './stateApiMapper';

describe('stateService', () => {
  let mock: MockAdapter;

  const stateDto: StateApiDto = {
    id: 1,
    nome: 'São Paulo',
    sigla: 'SP',
    dataHoraCadastro: '2026-01-01T00:00:00Z',
    dataHoraUltimaAtualizacao: null,
  };

  beforeEach(() => {
    mock = new MockAdapter(httpClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it('list GETs the paginated endpoint and unwraps content into a flat array', async () => {
    // size=100 covers the whole dataset (27 Brazilian states) in a single
    // page - the backend removed the unpaginated GET /estado (ADR 0018),
    // /paginado is now the only listing endpoint.
    mock.onGet('/estado/paginado', { params: { size: 100 } }).reply(200, {
      content: [stateDto],
      page: { size: 100, number: 0, totalElements: 1, totalPages: 1 },
    });

    const result = await stateService.list();

    expect(result).toEqual([
      {
        id: 1,
        name: 'São Paulo',
        abbreviation: 'SP',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: null,
      },
    ]);
  });

  it('list includes busca in the query string when a filter is provided', async () => {
    mock.onGet('/estado/paginado', { params: { size: 100, busca: 'santa' } }).reply(200, {
      content: [stateDto],
      page: { size: 100, number: 0, totalElements: 1, totalPages: 1 },
    });

    const result = await stateService.list('santa');

    expect(result).toHaveLength(1);
  });

  it('list includes sort in the query string when provided', async () => {
    mock.onGet('/estado/paginado', { params: { size: 100, sort: 'nome,asc' } }).reply(200, {
      content: [stateDto],
      page: { size: 100, number: 0, totalElements: 1, totalPages: 1 },
    });

    const result = await stateService.list(undefined, 'nome,asc');

    expect(result).toHaveLength(1);
  });

  it('list omits busca/sort from the query string when not provided', async () => {
    mock.onGet('/estado/paginado', { params: { size: 100 } }).reply(200, {
      content: [stateDto],
      page: { size: 100, number: 0, totalElements: 1, totalPages: 1 },
    });

    const result = await stateService.list();

    expect(result).toHaveLength(1);
  });

  it('update PUTs to /estado/{id} with only nome/sigla in the body', async () => {
    const state: State = {
      id: 1,
      name: 'São Paulo',
      abbreviation: 'SP',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: null,
    };
    mock.onPut('/estado/1', { nome: 'São Paulo', sigla: 'SP' }).reply(200, stateDto);

    const result = await stateService.update(state);

    expect(result.id).toBe(1);
    expect(mock.history.put[0].url).toBe('/estado/1');
  });
});
