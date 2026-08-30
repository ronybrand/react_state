export interface State {
  id: number;
  name: string;
  abbreviation: string;
  createdAt: string;
  updatedAt: string;
}

export type NewState = Pick<State, 'name' | 'abbreviation'>;
