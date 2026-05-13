import { referenceRepository } from '@/repositories/referenceRepository.ts';
import { LdfHelper } from '@/utils/LdfHelper.ts';
import { getDictionaryPageTitle } from '@/utils/getDictionaryPageTitle.ts';
import { fetchPageContent } from '@/utils/fetchPageContent.ts';
import { termRepository } from '@/repositories/termRepository.ts';

export async function syncDictionaries(dictionaryIds: string[]) {
  for (const dictionaryId of dictionaryIds) {
    try {
      const ldfPageTitle = getDictionaryPageTitle(dictionaryId);
      const ldf = await fetchPageContent(ldfPageTitle);

      if (ldf) {
        const document = LdfHelper.parse(ldf);
        await referenceRepository.replaceDictionaryReferences(document);
        await termRepository.replaceDictionaryTerms(document);
      }
    } catch (error) {
      console.error(`Failed to sync dictionary ${dictionaryId}`, error);
      mw.notify(`Không thể đồng bộ nội dung từ điển ${dictionaryId}`, { type: 'error' });
    }
  }
}
