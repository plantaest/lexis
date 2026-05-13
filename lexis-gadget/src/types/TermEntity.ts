import type { TermReferenceEntry } from '@/types/Term.ts';

export interface TermEntity {
  order?: number;
  dictionaryId: string;
  term: string;
  normalizedTerm: string;
  aliases: string[];
  normalizedAliases: string[];
  searchKeys: string[];
  translations: TermTranslationEntity[];
}

export interface TermTranslationEntity {
  target: string;
  note?: string;
  references: TermReferenceEntry[];
}
