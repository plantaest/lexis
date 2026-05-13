import { Dexie, type Table } from 'dexie';
import type { ReferenceEntity } from '@/types/ReferenceEntity.ts';
import type { TermEntity } from '@/types/TermEntity.ts';

export const db = new Dexie('LexisDatabase') as Dexie & {
  refs: Table<ReferenceEntity, [string, string]>;
  terms: Table<TermEntity, [string, string]>;
};

db.version(1).stores({
  refs: '[dictionaryId+refId], [dictionaryId+order], dictionaryId, refId, content',
  terms: '[dictionaryId+term], [dictionaryId+order], dictionaryId, *searchKeys',
});
