import { useMutation, useQueryCache } from '@pinia/colada';
import type { Dictionary } from '@/types/Dictionary.ts';
import { mwApi } from '@/utils/mwApi.ts';
import { useTabNavigation } from '@/composables/useTabNavigation.ts';
import { fetchPageContent } from '@/utils/fetchPageContent.ts';
import type { DictionaryIndex } from '@/types/DictionaryIndex.ts';
import { extractUniqueCode } from '@/utils/extractUniqueCode.ts';
import { getIndexPageTitle } from '@/utils/getIndexPageTitle.ts';

export function useUpdateDictionary() {
  const nav = useTabNavigation();
  const queryCache = useQueryCache();

  return useMutation({
    mutation: async (dictionary: Dictionary) => {
      const indexPageTitle = getIndexPageTitle(dictionary.type);
      const indexPageContent = await fetchPageContent(indexPageTitle);
      const indexData: DictionaryIndex = JSON.parse(indexPageContent ?? '{}');
      const uniqueCode = extractUniqueCode(dictionary.id);

      indexData[uniqueCode] = dictionary;

      await mwApi.postWithToken('csrf', {
        action: 'edit',
        title: indexPageTitle,
        text: JSON.stringify(indexData),
        contentmodel: 'json',
        summary: `Cập nhật từ điển ${dictionary.id} [#Lexis]`,
      });

      return { dictionary };
    },
    onSuccess: (variables) => {
      mw.notify('Cập nhật từ điển thành công', { type: 'success' });
      void queryCache.invalidateQueries({ key: ['dictionary', 'one', variables.dictionary.id] });
      nav.push('/dictionary/info', { dictionaryId: variables.dictionary.id });
    },
    onError: (error) => mw.notify(`Cập nhật từ điển thất bại: ${error.message}`, { type: 'error' }),
  });
}
