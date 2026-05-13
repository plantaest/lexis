import { useMutation } from '@pinia/colada';
import { getDictionaryPageTitle } from '@/utils/getDictionaryPageTitle.ts';
import { fetchPageContent } from '@/utils/fetchPageContent.ts';
import { LdfHelper } from '@/utils/LdfHelper.ts';
import { mwApi } from '@/utils/mwApi.ts';
import type { DictionaryId } from '@/types/Dictionary.ts';
import { updateDictionaryOnIndex } from '@/utils/updateDictionaryOnIndex.ts';
import { referenceRepository } from '@/repositories/referenceRepository.ts';
import { useTabNavigation } from '@/composables/useTabNavigation.ts';
import { termRepository } from '@/repositories/termRepository.ts';

export function useDeleteReference(dictionaryId: DictionaryId) {
  const nav = useTabNavigation();

  return useMutation({
    mutation: async (refId: string) => {
      const usedByTerms = await termRepository.findTermsUsingReference(dictionaryId, refId);

      if (usedByTerms.length > 0) {
        throw new Error(
          `Tham khảo này không thể xóa vì đang được sử dụng bởi ${usedByTerms.length} mục từ`,
        );
      }

      // (1) Update LDF page
      const dictionaryPageTitle = getDictionaryPageTitle(dictionaryId);
      const dictionaryPageContent = await fetchPageContent(dictionaryPageTitle);

      if (dictionaryPageContent) {
        const ldfDocument = LdfHelper.parse(dictionaryPageContent);

        // Update and serialize LDF
        ldfDocument.refs = ldfDocument.refs.filter((r) => r.id !== refId);
        ldfDocument.refIds.delete(refId);
        const serializedLdfDocument = LdfHelper.serialize(ldfDocument);

        await mwApi.postWithToken('csrf', {
          action: 'edit',
          title: dictionaryPageTitle,
          text: serializedLdfDocument,
          contentmodel: 'text',
          summary: `Xóa tham khảo '${refId}' cho từ điển ${dictionaryId} [#Lexis]`,
        });
      }

      // (2) Update dictionary on Index
      await updateDictionaryOnIndex(
        dictionaryId,
        `Xóa tham khảo '${refId}' cho từ điển ${dictionaryId} [#Lexis]`,
      );

      // (3) Update IndexedDB table
      await referenceRepository.deleteReference(dictionaryId, refId);
    },
    onSuccess: () => {
      mw.notify('Xóa tham khảo thành công', { type: 'success' });
      nav.push('/dictionary/info', { dictionaryId: dictionaryId, tab: 'refs' });
    },
    onError: (error) => mw.notify(`Xóa tham khảo thất bại: ${error.message}`, { type: 'error' }),
  });
}
