import type { NewState, State } from '../interfaces/state';

// Mirrors the backend's actual JSON contract (Portuguese field names) - an
// anti-corruption layer so the rest of the app only ever sees the English
// `State` domain type, independent of what the wire format looks like.
export interface StateApiDto {
  id: number;
  nome: string;
  sigla: string;
  dataHoraCadastro: string;
  dataHoraUltimaAtualizacao: string | null;
}

export type NewStateApiDto = Pick<StateApiDto, 'nome' | 'sigla'>;
export type UpdateStateApiDto = Pick<StateApiDto, 'nome' | 'sigla'>;

export interface PageApiDto<T> {
  content: T[];
}

export function toState(dto: StateApiDto): State {
  return {
    id: dto.id,
    name: dto.nome,
    abbreviation: dto.sigla,
    createdAt: dto.dataHoraCadastro,
    updatedAt: dto.dataHoraUltimaAtualizacao,
  };
}

export function toNewStateApiDto(state: NewState): NewStateApiDto {
  return {
    nome: state.name,
    sigla: state.abbreviation,
  };
}

// id is not part of the body - PUT /estado/{id} identifies the resource via
// the URL (see ADR 0018 in the backend repo).
export function toUpdateStateApiDto(state: State): UpdateStateApiDto {
  return {
    nome: state.name,
    sigla: state.abbreviation,
  };
}
