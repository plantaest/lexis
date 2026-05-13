import { useMutation } from '@pinia/colada';
import { getDictionaryPageTitle } from '@/utils/getDictionaryPageTitle.ts';
import { fetchPageContent } from '@/utils/fetchPageContent.ts';
import { LdfHelper } from '@/utils/LdfHelper.ts';
import { mwApi } from '@/utils/mwApi.ts';
import type { DictionaryId } from '@/types/Dictionary.ts';
import { updateDictionaryOnIndex } from '@/utils/updateDictionaryOnIndex.ts';
import { termRepository } from '@/repositories/termRepository.ts';
import { useTabNavigation } from '@/composables/useTabNavigation.ts';

export function useDeleteTerm(dictionaryId: DictionaryId) {
  const nav = useTabNavigation();

  return useMutation({
    mutation: async (termLemma: string) => {
      // (1) Update LDF page
      const dictionaryPageTitle = getDictionaryPageTitle(dictionaryId);
      const dictionaryPageContent = await fetchPageContent(dictionaryPageTitle);

      if (dictionaryPageContent) {
        const ldfDocument = LdfHelper.parse(dictionaryPageContent);

        // Update and serialize LDF
        ldfDocument.terms = ldfDocument.terms.filter((t) => t.term !== termLemma);
        ldfDocument.termLemmas.delete(termLemma);
        const serializedLdfDocument = LdfHelper.serialize(ldfDocument);

        await mwApi.postWithToken('csrf', {
          action: 'edit',
          title: dictionaryPageTitle,
          text: serializedLdfDocument,
          contentmodel: 'text',
          summary: `Xóa mục từ '${termLemma}' cho từ điển ${dictionaryId} [#Lexis]`,
        });
      }

      // (2) Update dictionary on Index
      await updateDictionaryOnIndex(
        dictionaryId,
        `Xóa mục từ '${termLemma}' cho từ điển ${dictionaryId} [#Lexis]`,
      );

      // (3) Update IndexedDB table
      await termRepository.deleteTerm(dictionaryId, termLemma);
    },
    onSuccess: () => {
      mw.notify('Xóa mục từ thành công', { type: 'success' });
      nav.push('/dictionary/info', { dictionaryId: dictionaryId, tab: 'terms' });
    },
    onError: (error) => mw.notify(`Xóa mục từ thất bại: ${error.message}`, { type: 'error' }),
  });
}
