import { useMutation } from '@pinia/colada';
import type { Dictionary } from '@/types/Dictionary.ts';
import { mwApi } from '@/utils/mwApi.ts';
import { useTabNavigation } from '@/composables/useTabNavigation.ts';
import { fetchPageContent } from '@/utils/fetchPageContent.ts';
import type { DictionaryIndex } from '@/types/DictionaryIndex.ts';
import { extractUniqueCode } from '@/utils/extractUniqueCode.ts';
import { useUserConfigStore } from '@/stores/userConfig.ts';
import { constants } from '@/utils/constants.ts';
import { mwForeignApi } from '@/utils/mwForeignApi.ts';
import { toRaw } from 'vue';
import { getIndexPageTitle } from '@/utils/getIndexPageTitle.ts';

export function useCreateDictionary() {
  const nav = useTabNavigation();
  const userConfigStore = useUserConfigStore();

  return useMutation({
    mutation: async (dictionary: Dictionary) => {
      // (0) Validation
      if (dictionary.type === 'private' && userConfigStore.privateDictionaryIds.length > 0) {
        throw new Error('Không được tạo thêm từ điển cá nhân');
      }

      // (1) Create dictionary data page
      const namespace = mw.config.get('wgFormattedNamespaces')[4]!;
      const dictionaryPageTitle = `${namespace}:Lexis/${dictionary.id}.ldf`; // ldf: Lexis Dictionary Format
      const dictionaryPageContent = `@id ${dictionary.id}\n\n#refs\n\n#terms`;

      await mwApi.postWithToken('csrf', {
        action: 'edit',
        title: dictionaryPageTitle,
        text: dictionaryPageContent,
        contentmodel: 'text',
        summary: `Tạo từ điển ${dictionary.id} [#Lexis]`,
      });

      // (2) Save dictionary metadata on Index
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
        summary: `Thêm từ điển ${dictionary.id} [#Lexis]`,
      });

      // (3) Save dictionary id for userConfig option
      const userConfig = structuredClone(toRaw(userConfigStore.$state));

      if (dictionary.type === 'private') {
        userConfig.privateDictionaryIds = [...userConfig.privateDictionaryIds, dictionary.id];
        userConfig.privateDictionaryEnabled = {
          ...userConfig.privateDictionaryEnabled,
          [dictionary.id]: true,
        };
      }

      if (dictionary.type === 'public') {
        userConfig.publicDictionaryIds = [...userConfig.publicDictionaryIds, dictionary.id];
        userConfig.publicDictionaryEnabled = {
          ...userConfig.publicDictionaryEnabled,
          [dictionary.id]: true,
        };
      }

      await mwForeignApi.saveOption(constants.userConfigOptionKey, JSON.stringify(userConfig));

      return { userConfig };
    },
    onSuccess: (variables) => {
      mw.notify('Tạo từ điển thành công', { type: 'success' });
      userConfigStore.override(variables.userConfig);
      nav.push('/dictionary/list');
    },
    onError: (error) => mw.notify(`Tạo từ điển thất bại: ${error.message}`, { type: 'error' }),
  });
}
