import { toNewStateApiDto, toState, toStateApiDto, type StateApiDto } from './stateApiMapper';

const dto: StateApiDto = {
  id: 1,
  nome: 'São Paulo',
  sigla: 'SP',
  dataHoraCadastro: '2024-01-01T10:00:00Z',
  dataHoraUltimaAtualizacao: '2024-01-02T10:00:00Z',
};

describe('stateApiMapper', () => {
  it('maps an API dto to the State domain type', () => {
    expect(toState(dto)).toEqual({
      id: 1,
      name: 'São Paulo',
      abbreviation: 'SP',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-02T10:00:00Z',
    });
  });

  it('maps a State back to the API dto shape', () => {
    expect(toStateApiDto(toState(dto))).toEqual(dto);
  });

  it('maps a NewState to the API dto shape used for creation', () => {
    expect(toNewStateApiDto({ name: 'Rio de Janeiro', abbreviation: 'RJ' })).toEqual({
      nome: 'Rio de Janeiro',
      sigla: 'RJ',
    });
  });
});
