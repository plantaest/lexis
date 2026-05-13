import { useQuery } from '@pinia/colada';
import { fetchPageContent } from '@/utils/fetchPageContent.ts';
import { getIndexPageTitle } from '@/utils/getIndexPageTitle.ts';
import type { Dictionary, DictionaryType } from '@/types/Dictionary.ts';
import type { DictionaryIndex } from '@/types/DictionaryIndex.ts';
import { extractUniqueCode } from '@/utils/extractUniqueCode.ts';
import { type MaybeRef, unref } from 'vue';

export function useGetListDictionaryByIds(dictionaryType: DictionaryType, ids: MaybeRef<string[]>) {
  return useQuery<Dictionary[]>({
    key: ['dictionary', 'list', dictionaryType, unref(ids)],
    query: async () => {
      const indexPageTitle = getIndexPageTitle(dictionaryType);
      const indexPageContent = await fetchPageContent(indexPageTitle);
      const indexData: DictionaryIndex = JSON.parse(indexPageContent ?? '{}');

      const dictionaries: Dictionary[] = [];

      for (const id of unref(ids)) {
        const uniqueCode = extractUniqueCode(id);
        const dictionary = indexData[uniqueCode];
        if (dictionary) {
          dictionaries.push(dictionary);
        }
      }

      return dictionaries.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    },
  });
}
