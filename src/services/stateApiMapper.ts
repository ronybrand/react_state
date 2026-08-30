import type { NewState, State } from '../interfaces/state';

// Mirrors the backend's actual JSON contract (Portuguese field names) - an
// anti-corruption layer so the rest of the app only ever sees the English
// `State` domain type, independent of what the wire format looks like.
export interface StateApiDto {
  id: number;
  nome: string;
  sigla: string;
  dataHoraCadastro: string;
  dataHoraUltimaAtualizacao: string;
}

export type NewStateApiDto = Pick<StateApiDto, 'nome' | 'sigla'>;

export function toState(dto: StateApiDto): State {
  return {
    id: dto.id,
    name: dto.nome,
    abbreviation: dto.sigla,
    createdAt: dto.dataHoraCadastro,
    updatedAt: dto.dataHoraUltimaAtualizacao,
  };
}

export function toStateApiDto(state: State): StateApiDto {
  return {
    id: state.id,
    nome: state.name,
    sigla: state.abbreviation,
    dataHoraCadastro: state.createdAt,
    dataHoraUltimaAtualizacao: state.updatedAt,
  };
}

export function toNewStateApiDto(state: NewState): NewStateApiDto {
  return {
    nome: state.name,
    sigla: state.abbreviation,
  };
}
