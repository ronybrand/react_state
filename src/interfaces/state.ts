import { z } from 'zod';

export interface State {
  id: number;
  name: string;
  abbreviation: string;
  createdAt: string;
  updatedAt: string | null;
}

export const newStateSchema = z.object({
  abbreviation: z.string().trim().length(2, 'Enter the state abbreviation.'),
  name: z.string().trim().min(3, 'Enter the state name.').max(100, 'Enter the state name.'),
});

export type NewState = z.infer<typeof newStateSchema>;
