import { useMutation } from '@pinia/colada';
import type { Term } from '@/types/Term.ts';
import { getDictionaryPageTitle } from '@/utils/getDictionaryPageTitle.ts';
import { fetchPageContent } from '@/utils/fetchPageContent.ts';
import { LdfHelper } from '@/utils/LdfHelper.ts';
import { mwApi } from '@/utils/mwApi.ts';
import type { DictionaryId } from '@/types/Dictionary.ts';
import { updateDictionaryOnIndex } from '@/utils/updateDictionaryOnIndex.ts';
import { termRepository } from '@/repositories/termRepository.ts';
import { useTabNavigation } from '@/composables/useTabNavigation.ts';

export function useUpdateTerm(dictionaryId: DictionaryId) {
  const nav = useTabNavigation();

  return useMutation({
    mutation: async ({ term, oldTerm }: { term: Term; oldTerm: string }) => {
      // (1) Update LDF page
      const dictionaryPageTitle = getDictionaryPageTitle(dictionaryId);
      const dictionaryPageContent = await fetchPageContent(dictionaryPageTitle);

      if (dictionaryPageContent) {
        const ldfDocument = LdfHelper.parse(dictionaryPageContent);

        // Validation
        if (oldTerm !== term.term && ldfDocument.termLemmas.has(term.term)) {
          throw new Error(`Mục từ '${term.term}' đã có trong từ điển`);
        }

        // Update and serialize LDF
        ldfDocument.terms = ldfDocument.terms.map((t) => (t.term === oldTerm ? term : t));
        ldfDocument.termLemmas.add(term.term);
        ldfDocument.termLemmas.delete(oldTerm);
        const serializedLdfDocument = LdfHelper.serialize(ldfDocument);

        await mwApi.postWithToken('csrf', {
          action: 'edit',
          title: dictionaryPageTitle,
          text: serializedLdfDocument,
          contentmodel: 'text',
          summary: `Sửa mục từ '${term.term}' cho từ điển ${dictionaryId} [#Lexis]`,
        });
      }

      // (2) Update dictionary on Index
      await updateDictionaryOnIndex(
        dictionaryId,
        `Sửa mục từ '${term.term}' cho từ điển ${dictionaryId} [#Lexis]`,
      );

      // (3) Update IndexedDB table
      const termEntity = termRepository.toEntity(dictionaryId, term);
      await termRepository.putTerm(termEntity, oldTerm);
    },
    onSuccess: () => {
      mw.notify('Sửa mục từ thành công', { type: 'success' });
      nav.push('/dictionary/info', { dictionaryId: dictionaryId, tab: 'terms' });
    },
    onError: (error) => mw.notify(`Sửa mục từ thất bại: ${error.message}`, { type: 'error' }),
  });
}
