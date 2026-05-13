import type { DictionaryId } from '@/types/Dictionary.ts';

export function getDictionaryPageTitle(dictionaryId: DictionaryId) {
  const namespace = mw.config.get('wgFormattedNamespaces')[4]!;
  return `${namespace}:Lexis/${dictionaryId}.ldf`;
}
