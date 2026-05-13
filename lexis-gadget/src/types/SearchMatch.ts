import type { TermEntity } from '@/types/TermEntity.ts';

export interface SearchMatch {
  matchedText: string;
  normalizedMatchedText: string;
  start: number;
  end: number;
  matchedBy: 'term' | 'alias' | 'generated';
  score: number;
  term: TermEntity;
}
