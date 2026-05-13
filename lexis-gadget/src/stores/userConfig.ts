import { defineStore } from 'pinia';
import type { UserConfig } from '@/types/UserConfig.ts';
import { fetchUserOption } from '@/utils/fetchUserOption.ts';
import { constants } from '@/utils/constants.ts';
import { saveUserOption } from '@/utils/saveUserOption.ts';

export const useUserConfigStore = defineStore('userConfig', {
  state: (): UserConfig => ({
    privateDictionaryIds: [],
    privateDictionaryEnabled: {},
    publicDictionaryIds: [],
    publicDictionaryEnabled: {},
  }),
  actions: {
    async initialize() {
      const userConfig = await fetchUserOption(constants.userConfigOptionKey);

      if (!userConfig) {
        await saveUserOption(constants.userConfigOptionKey, JSON.stringify(this.$state));
        return;
      }

      this.$patch(JSON.parse(userConfig));
    },
    override(userConfig: UserConfig) {
      this.privateDictionaryIds = userConfig.privateDictionaryIds;
      this.privateDictionaryEnabled = userConfig.privateDictionaryEnabled;
      this.publicDictionaryIds = userConfig.publicDictionaryIds;
      this.publicDictionaryEnabled = userConfig.publicDictionaryEnabled;
    },
  },
});
