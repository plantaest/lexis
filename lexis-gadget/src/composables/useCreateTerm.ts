import type { DictionaryId } from '@/types/Dictionary.ts';
import { useTabNavigation } from '@/composables/useTabNavigation.ts';
import { useMutation } from '@pinia/colada';
import { getDictionaryPageTitle } from '@/utils/getDictionaryPageTitle.ts';
import { fetchPageContent } from '@/utils/fetchPageContent.ts';
import { LdfHelper } from '@/utils/LdfHelper.ts';
import { mwApi } from '@/utils/mwApi.ts';
import { updateDictionaryOnIndex } from '@/utils/updateDictionaryOnIndex.ts';
import type { Term } from '@/types/Term.ts';
import { termRepository } from '@/repositories/termRepository.ts';

export function useCreateTerm(dictionaryId: DictionaryId) {
  const nav = useTabNavigation();

  return useMutation({
    mutation: async (term: Term) => {
      // (1) Update LDF page
      const dictionaryPageTitle = getDictionaryPageTitle(dictionaryId);
      const dictionaryPageContent = await fetchPageContent(dictionaryPageTitle);

      if (dictionaryPageContent) {
        const ldfDocument = LdfHelper.parse(dictionaryPageContent);

        // Validation
        if (ldfDocument.termLemmas.has(term.term)) {
          throw new Error(`Mục từ '${term.term}' đã có trong từ điển`);
        }

        // Update and serialize LDF
        LdfHelper.addTerm(ldfDocument, term);
        const serializedLdfDocument = LdfHelper.serialize(ldfDocument);

        await mwApi.postWithToken('csrf', {
          action: 'edit',
          title: dictionaryPageTitle,
          text: serializedLdfDocument,
          contentmodel: 'text',
          summary: `Thêm mục từ '${term.term}' cho từ điển ${dictionaryId} [#Lexis]`,
        });
      }

      // (2) Update dictionary on Index
      await updateDictionaryOnIndex(
        dictionaryId,
        `Thêm mục từ '${term.term}' cho từ điển ${dictionaryId} [#Lexis]`,
      );

      // (3) Update IndexedDB table
      const termEntity = termRepository.toEntity(dictionaryId, term);
      await termRepository.putTerm(termEntity);
    },
    onSuccess: () => {
      mw.notify('Thêm mục từ thành công', { type: 'success' });
      nav.push('/dictionary/info', { dictionaryId: dictionaryId, tab: 'terms' });
    },
    onError: (error) => mw.notify(`Thêm mục từ thất bại: ${error.message}`, { type: 'error' }),
  });
}
