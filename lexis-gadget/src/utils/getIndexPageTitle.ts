import type { DictionaryType } from '@/types/Dictionary.ts';

export function getIndexPageTitle(dictionaryType: DictionaryType) {
  const namespace = mw.config.get('wgFormattedNamespaces')[4]!;
  return `${namespace}:Lexis/Lexis.Dict.${dictionaryType === 'private' ? 'Private' : 'Public'}.Index.json`;
}
