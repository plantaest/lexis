import { useMutation, useQueryCache } from '@pinia/colada';
import type { DictionaryId } from '@/types/Dictionary.ts';
import { getDictionaryTypeFromId } from '@/utils/getDictionaryTypeFromId.ts';
import { getIndexPageTitle } from '@/utils/getIndexPageTitle.ts';
import { fetchPageContent } from '@/utils/fetchPageContent.ts';
import type { DictionaryIndex } from '@/types/DictionaryIndex.ts';
import { extractUniqueCode } from '@/utils/extractUniqueCode.ts';
import { useUserConfigStore } from '@/stores/userConfig.ts';
import { toRaw } from 'vue';
import { mwForeignApi } from '@/utils/mwForeignApi.ts';
import { constants } from '@/utils/constants.ts';

// Use only for public dictionaries
export function useSaveDictionary() {
  const userConfigStore = useUserConfigStore();
  const queryCache = useQueryCache();

  return useMutation({
    mutation: async (dictionaryId: DictionaryId) => {
      const dictionaryType = getDictionaryTypeFromId(dictionaryId);
      const indexPageTitle = getIndexPageTitle(dictionaryType);
      const indexPageContent = await fetchPageContent(indexPageTitle);
      const indexData: DictionaryIndex = JSON.parse(indexPageContent ?? '{}');
      const uniqueCode = extractUniqueCode(dictionaryId);
      const dictionary = indexData[uniqueCode];

      if (dictionary === undefined) {
        throw new Error(`Không tìm thấy từ điển theo ID ${dictionaryId}`);
      }

      const userConfig = structuredClone(toRaw(userConfigStore.$state));
      userConfig.publicDictionaryIds = [...userConfig.publicDictionaryIds, dictionaryId];
      userConfig.publicDictionaryEnabled = {
        ...userConfig.publicDictionaryEnabled,
        [dictionaryId]: true,
      };

      await mwForeignApi.saveOption(constants.userConfigOptionKey, JSON.stringify(userConfig));

      return { userConfig, dictionaryId };
    },
    onSuccess: (variables) => {
      mw.notify('Lưu từ điển thành công', { type: 'success' });
      userConfigStore.override(variables.userConfig);
      void queryCache.invalidateQueries({ key: ['dictionary', 'list', 'public'] });
    },
    onError: (error) => mw.notify(`Lưu từ điển thất bại: ${error.message}`, { type: 'error' }),
  });
}
