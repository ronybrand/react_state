import { z } from 'zod';

export type StateValidationMessageKey =
  | 'abbreviationLengthError'
  | 'abbreviationFormatError'
  | 'abbreviationDuplicateError'
  | 'nameMinError'
  | 'nameMaxError';

const stateValidationMessageKeys: ReadonlySet<string> = new Set([
  'abbreviationLengthError',
  'abbreviationFormatError',
  'abbreviationDuplicateError',
  'nameMinError',
  'nameMaxError',
]);

export function isStateValidationMessageKey(message: string): message is StateValidationMessageKey {
  return stateValidationMessageKeys.has(message);
}

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
      .length(2, 'abbreviationLengthError')
      .regex(/^[A-Z]{2}$/, 'abbreviationFormatError')
      .refine(
        (value) => value === currentAbbreviation || !existingAbbreviations.includes(value),
        'abbreviationDuplicateError',
      ),
    name: z.string().trim().min(3, 'nameMinError').max(100, 'nameMaxError'),
  });
}

export const newStateSchema = createNewStateSchema();

export type NewState = z.infer<typeof newStateSchema>;
