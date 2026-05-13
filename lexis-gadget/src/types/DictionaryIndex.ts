import type { Dictionary } from '@/types/Dictionary.ts';

type UniqueCode = string;

export type DictionaryIndex = Record<UniqueCode, Dictionary>;
