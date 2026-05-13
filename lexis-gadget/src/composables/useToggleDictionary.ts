import { useMutation, useQueryCache } from '@pinia/colada';
import type { DictionaryId } from '@/types/Dictionary.ts';
import { useUserConfigStore } from '@/stores/userConfig.ts';
import { getDictionaryTypeFromId } from '@/utils/getDictionaryTypeFromId.ts';
import { toRaw } from 'vue';
import { mwForeignApi } from '@/utils/mwForeignApi.ts';
import { constants } from '@/utils/constants.ts';

export function useToggleDictionary() {
  const userConfigStore = useUserConfigStore();
  const queryCache = useQueryCache();

  return useMutation({
    mutation: async (dictionaryId: DictionaryId) => {
      const dictionaryType = getDictionaryTypeFromId(dictionaryId);
      const userConfig = structuredClone(toRaw(userConfigStore.$state));

      const mapEnabled =
        dictionaryType === 'private'
          ? userConfig.privateDictionaryEnabled
          : userConfig.publicDictionaryEnabled;

      const current = mapEnabled[dictionaryId];
      if (current !== undefined) {
        mapEnabled[dictionaryId] = !current;
      }

      await mwForeignApi.saveOption(constants.userConfigOptionKey, JSON.stringify(userConfig));

      return { userConfig, dictionaryId };
    },
    onSuccess: (variables) => {
      mw.notify('Bật/Tắt kích hoạt từ điển thành công', { type: 'success' });
      userConfigStore.override(variables.userConfig);
      void queryCache.invalidateQueries({ key: ['dictionary', 'one', variables.dictionaryId] });
    },
    onError: (error) =>
      mw.notify(`Bật/Tắt kích hoạt từ điển thất bại: ${error.message}`, { type: 'error' }),
  });
}
