import { useMutation } from '@pinia/colada';
import type { Reference } from '@/types/Reference.ts';
import type { DictionaryId } from '@/types/Dictionary.ts';
import { fetchPageContent } from '@/utils/fetchPageContent.ts';
import { mwApi } from '@/utils/mwApi.ts';
import { useTabNavigation } from '@/composables/useTabNavigation.ts';
import { getDictionaryPageTitle } from '@/utils/getDictionaryPageTitle.ts';
import { LdfHelper } from '@/utils/LdfHelper.ts';
import { updateDictionaryOnIndex } from '@/utils/updateDictionaryOnIndex.ts';
import { referenceRepository } from '@/repositories/referenceRepository.ts';

export function useCreateReference(dictionaryId: DictionaryId) {
  const nav = useTabNavigation();

  return useMutation({
    mutation: async (reference: Reference) => {
      // (1) Update LDF page
      const dictionaryPageTitle = getDictionaryPageTitle(dictionaryId);
      const dictionaryPageContent = await fetchPageContent(dictionaryPageTitle);

      if (dictionaryPageContent) {
        const ldfDocument = LdfHelper.parse(dictionaryPageContent);

        // Validation
        if (ldfDocument.refIds.has(reference.id)) {
          throw new Error(`ID '${reference.id}' của tham khảo này đã được sử dụng`);
        }

        // Update and serialize LDF
        LdfHelper.addReference(ldfDocument, reference);
        const serializedLdfDocument = LdfHelper.serialize(ldfDocument);

        await mwApi.postWithToken('csrf', {
          action: 'edit',
          title: dictionaryPageTitle,
          text: serializedLdfDocument,
          contentmodel: 'text',
          summary: `Thêm tham khảo '${reference.id}' cho từ điển ${dictionaryId} [#Lexis]`,
        });
      }

      // (2) Update dictionary on Index
      await updateDictionaryOnIndex(
        dictionaryId,
        `Thêm tham khảo '${reference.id}' cho từ điển ${dictionaryId} [#Lexis]`,
      );

      // (3) Update IndexedDB table
      const referenceEntity = referenceRepository.toEntity(dictionaryId, reference);
      await referenceRepository.putReference(referenceEntity);
    },
    onSuccess: () => {
      mw.notify('Thêm tham khảo thành công', { type: 'success' });
      nav.push('/dictionary/info', { dictionaryId: dictionaryId, tab: 'refs' });
    },
    onError: (error) => mw.notify(`Thêm tham khảo thất bại: ${error.message}`, { type: 'error' }),
  });
}
