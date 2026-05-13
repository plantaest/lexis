import type { Dictionary, DictionaryId } from '@/types/Dictionary.ts';
import { useQuery } from '@pinia/colada';
import { getDictionaryTypeFromId } from '@/utils/getDictionaryTypeFromId.ts';
import { getIndexPageTitle } from '@/utils/getIndexPageTitle.ts';
import { fetchPageContent } from '@/utils/fetchPageContent.ts';
import type { DictionaryIndex } from '@/types/DictionaryIndex.ts';
import { extractUniqueCode } from '@/utils/extractUniqueCode.ts';

export function useGetOneDictionary(dictionaryId: DictionaryId) {
  return useQuery<Dictionary | null>({
    key: ['dictionary', 'one', dictionaryId],
    query: async () => {
      const dictionaryType = getDictionaryTypeFromId(dictionaryId);
      const indexPageTitle = getIndexPageTitle(dictionaryType);
      const indexPageContent = await fetchPageContent(indexPageTitle);
      const indexData: DictionaryIndex = JSON.parse(indexPageContent ?? '{}');
      const uniqueCode = extractUniqueCode(dictionaryId);
      return indexData[uniqueCode] ?? null;
    },
  });
}
