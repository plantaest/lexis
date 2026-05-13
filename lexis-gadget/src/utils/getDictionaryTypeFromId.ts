import type { DictionaryId, DictionaryType } from '@/types/Dictionary.ts';

export function getDictionaryTypeFromId(dictionaryId: DictionaryId): DictionaryType {
  return dictionaryId.includes('Private') ? 'private' : 'public';
}
