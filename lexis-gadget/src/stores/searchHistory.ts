import { defineStore } from 'pinia';

export interface SearchHistoryItem {
  text: string;
  searchedAt: number;
}

const STORAGE_KEY = 'lexis.searchHistory';
const MAX_HISTORY_ITEMS = 50;

const loadHistory = (): SearchHistoryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const useSearchHistoryStore = defineStore('searchHistory', {
  state: () => ({
    items: loadHistory() as SearchHistoryItem[],
  }),
  actions: {
    save(): void {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    },
    add(text: string): void {
      const normalized = text.trim();

      if (!normalized) {
        return;
      }

      this.items = this.items.filter((item) => item.text !== normalized);

      this.items.unshift({
        text: normalized,
        searchedAt: Date.now(),
      });

      this.items = this.items.slice(0, MAX_HISTORY_ITEMS);

      this.save();
    },

    clear(): void {
      this.items = [];
      this.save();
    },
  },
});
