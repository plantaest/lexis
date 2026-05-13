import type { DictionaryId } from '@/types/Dictionary.ts';
import { getDictionaryTypeFromId } from '@/utils/getDictionaryTypeFromId.ts';
import { getIndexPageTitle } from '@/utils/getIndexPageTitle.ts';
import { fetchPageContent } from '@/utils/fetchPageContent.ts';
import type { DictionaryIndex } from '@/types/DictionaryIndex.ts';
import { extractUniqueCode } from '@/utils/extractUniqueCode.ts';
import type { User } from '@/types/User.ts';
import { getNowDate } from '@/utils/getNowDate.ts';
import { upsertContributor } from '@/utils/upsertContributor.ts';
import { mwApi } from '@/utils/mwApi.ts';

export async function updateDictionaryOnIndex(dictionaryId: DictionaryId, summaryText: string) {
  const dictionaryType = getDictionaryTypeFromId(dictionaryId);
  const indexPageTitle = getIndexPageTitle(dictionaryType);
  const indexPageContent = await fetchPageContent(indexPageTitle);
  const indexData: DictionaryIndex = JSON.parse(indexPageContent ?? '{}');
  const uniqueCode = extractUniqueCode(dictionaryId);

  const contributor: User = {
    id: mw.config.get('wgUserId')!,
    name: mw.config.get('wgUserName')!,
  };

  const now = getNowDate();

  const dictionary = indexData[uniqueCode];

  if (dictionary) {
    dictionary.contributors = upsertContributor(dictionary.contributors, contributor);
    dictionary.updatedAt = now;
  }

  await mwApi.postWithToken('csrf', {
    action: 'edit',
    title: indexPageTitle,
    text: JSON.stringify(indexData),
    contentmodel: 'json',
    summary: summaryText,
  });
}
