import { z } from 'zod';
import type { Translate } from '../i18n/TranslationProvider';

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
  translate?: Translate,
) {
  return z.object({
    abbreviation: z
      .string()
      .trim()
      .toUpperCase()
      .length(
        2,
        translate?.('abbreviationLengthError') ?? 'Enter the state abbreviation with 2 letters.',
      )
      .regex(
        /^[A-Z]{2}$/,
        translate?.('abbreviationFormatError') ??
          'Enter the state abbreviation with 2 uppercase letters.',
      )
      .refine(
        (value) => value === currentAbbreviation || !existingAbbreviations.includes(value),
        translate?.('abbreviationDuplicateError') ??
          'A state with this abbreviation already exists.',
      ),
    name: z
      .string()
      .trim()
      .min(3, translate?.('nameMinError') ?? 'Enter the state name with at least 3 characters.')
      .max(100, translate?.('nameMaxError') ?? 'Enter the state name with at most 100 characters.'),
  });
}

export const newStateSchema = createNewStateSchema();

export type NewState = z.infer<typeof newStateSchema>;
