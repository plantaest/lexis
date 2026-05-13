import { useMutation } from '@pinia/colada';
import type { Reference } from '@/types/Reference.ts';
import type { DictionaryId } from '@/types/Dictionary.ts';
import { fetchPageContent } from '@/utils/fetchPageContent.ts';
import { mwApi } from '@/utils/mwApi.ts';
import { getDictionaryPageTitle } from '@/utils/getDictionaryPageTitle.ts';
import { LdfHelper } from '@/utils/LdfHelper.ts';
import { updateDictionaryOnIndex } from '@/utils/updateDictionaryOnIndex.ts';
import { referenceRepository } from '@/repositories/referenceRepository.ts';

export function useImportReference(dictionaryId: DictionaryId) {
  return useMutation({
    mutation: async (references: Reference[]) => {
      // (1) Update LDF page
      const dictionaryPageTitle = getDictionaryPageTitle(dictionaryId);
      const dictionaryPageContent = await fetchPageContent(dictionaryPageTitle);

      if (dictionaryPageContent) {
        const ldfDocument = LdfHelper.parse(dictionaryPageContent);

        // Update and serialize LDF
        references.forEach((ref) => LdfHelper.addReference(ldfDocument, ref));
        const serializedLdfDocument = LdfHelper.serialize(ldfDocument);

        await mwApi.postWithToken('csrf', {
          action: 'edit',
          title: dictionaryPageTitle,
          text: serializedLdfDocument,
          contentmodel: 'text',
          summary: `Nhập ${references.length} tham khảo cho từ điển ${dictionaryId} [#Lexis]`,
        });
      }

      // (2) Update dictionary on Index
      await updateDictionaryOnIndex(
        dictionaryId,
        `Nhập ${references.length} tham khảo cho từ điển ${dictionaryId} [#Lexis]`,
      );

      // (3) Update IndexedDB table
      for (const reference of references) {
        const referenceEntity = referenceRepository.toEntity(dictionaryId, reference);
        await referenceRepository.putReference(referenceEntity);
      }
    },
    onSuccess: () => {
      mw.notify('Nhập tham khảo thành công', { type: 'success' });
    },
    onError: (error) => mw.notify(`Nhập tham khảo thất bại: ${error.message}`, { type: 'error' }),
  });
}
