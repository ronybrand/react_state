import { z } from 'zod';

export interface State {
  id: number;
  name: string;
  abbreviation: string;
  createdAt: string;
  updatedAt: string | null;
}

export function createNewStateSchema(
  existingAbbreviations: string[] = [],
  currentAbbreviation?: string,
) {
  return z.object({
    abbreviation: z
      .string()
      .trim()
      .toUpperCase()
      .length(2, 'Enter the state abbreviation with 2 letters.')
      .regex(/^[A-Z]{2}$/, 'Enter the state abbreviation with 2 uppercase letters.')
      .refine(
        (value) => value === currentAbbreviation || !existingAbbreviations.includes(value),
        'A state with this abbreviation already exists.',
      ),
    name: z
      .string()
      .trim()
      .min(3, 'Enter the state name with at least 3 characters.')
      .max(100, 'Enter the state name with at most 100 characters.'),
  });
}

export const newStateSchema = createNewStateSchema();

export type NewState = z.infer<typeof newStateSchema>;
