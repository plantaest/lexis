import type { User } from '@/types/User.ts';

export type DictionaryId = string;

export type DictionaryType = 'private' | 'public';

export interface Dictionary {
  id: DictionaryId;
  creator: User;
  contributors: User[];
  createdAt: string;
  updatedAt: string;
  type: DictionaryType;
  name: string;
  englishName: string;
  sourceLanguage: string;
  targetLanguage: string;
}
