import { defineStore } from 'pinia';
import type { SearchMatch } from '@/types/SearchMatch.ts';
import { searchService } from '@/utils/searchService.ts';
import { getActiveDictionaryIds } from '@/utils/getActiveDictionaryIds.ts';
import { useUserConfigStore } from './userConfig.ts';
import { useSearchHistoryStore } from '@/stores/searchHistory.ts';

export interface SearchState {
  text: string;
  results: SearchMatch[];
}

export const useSearchStore = defineStore('search', {
  state: (): SearchState => ({
    text: '',
    results: [],
  }),
  actions: {
    async search(): Promise<void> {
      const userConfigStore = useUserConfigStore();
      const historyStore = useSearchHistoryStore();

      this.results = await searchService.searchText(this.text, {
        activeDictionaryIds: getActiveDictionaryIds(userConfigStore.$state),
      });

      historyStore.add(this.text);
    },
    reset(): void {
      this.results = [];
    },
  },
});
