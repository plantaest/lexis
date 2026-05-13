import type { Reference } from '@/types/Reference.ts';
import type { Term } from '@/types/Term.ts';

export interface LdfDocument {
  meta: {
    [key: string]: unknown;
    id?: string;
  };
  refs: Reference[];
  refIds: Set<string>;
  terms: Term[];
  termLemmas: Set<string>;
}
