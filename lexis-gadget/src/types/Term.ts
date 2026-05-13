export interface Term {
  term: string;
  aliases: string[];
  translations: TermTranslation[];
}

export interface TermTranslation {
  target: string;
  note?: string;
  references: TermReferenceEntry[];
}

export type TermReferenceEntry =
  | {
      type: 'ref';
      id: string;
    }
  | {
      type: 'inline';
      content: string;
      url?: string;
    };
