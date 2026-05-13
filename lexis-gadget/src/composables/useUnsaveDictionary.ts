import { useUserConfigStore } from '@/stores/userConfig.ts';
import { useMutation, useQueryCache } from '@pinia/colada';
import type { DictionaryId } from '@/types/Dictionary.ts';
import { getDictionaryTypeFromId } from '@/utils/getDictionaryTypeFromId.ts';
import { toRaw } from 'vue';
import { mwForeignApi } from '@/utils/mwForeignApi.ts';
import { constants } from '@/utils/constants.ts';
import { useTabNavigation } from '@/composables/useTabNavigation.ts';

export function useUnsaveDictionary() {
  const nav = useTabNavigation();
  const userConfigStore = useUserConfigStore();
  const queryCache = useQueryCache();

  return useMutation({
    mutation: async (dictionaryId: DictionaryId) => {
      const dictionaryType = getDictionaryTypeFromId(dictionaryId);
      const userConfig = structuredClone(toRaw(userConfigStore.$state));

      if (dictionaryType === 'public') {
        userConfig.publicDictionaryIds = userConfig.publicDictionaryIds.filter(
          (id) => id !== dictionaryId,
        );
        delete userConfig.publicDictionaryEnabled[dictionaryId];
      }

      await mwForeignApi.saveOption(constants.userConfigOptionKey, JSON.stringify(userConfig));

      return { userConfig };
    },
    onSuccess: (variables) => {
      mw.notify('Bỏ lưu từ điển thành công', { type: 'success' });
      userConfigStore.override(variables.userConfig);
      void queryCache.invalidateQueries({ key: ['dictionary', 'list', 'public'] });
      nav.push('/dictionary/list');
    },
    onError: (error) => mw.notify(`Bỏ lưu từ điển thất bại: ${error.message}`, { type: 'error' }),
  });
}
