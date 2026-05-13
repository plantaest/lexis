import type { DictionaryId } from '@/types/Dictionary.ts';

export interface UserConfig {
  privateDictionaryIds: string[];
  privateDictionaryEnabled: Record<DictionaryId, boolean>;
  publicDictionaryIds: string[];
  publicDictionaryEnabled: Record<DictionaryId, boolean>;
}
