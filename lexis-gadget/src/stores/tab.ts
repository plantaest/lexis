import { defineStore } from 'pinia';
import type { TabPath, TabPayloadMap } from '@/types/Tab.ts';

export const useTabStore = defineStore('tab', {
  state: () => ({
    current: '/search' as TabPath,
    payload: {} as Partial<TabPayloadMap>,
  }),
  actions: {
    setTab<T extends TabPath>(tab: T, payload?: TabPayloadMap[T]) {
      this.current = tab;

      if (payload !== undefined) {
        this.payload[tab] = payload;
      }
    },
    getPayload<T extends TabPath>(tab: T): TabPayloadMap[T] | undefined {
      return this.payload[tab] as TabPayloadMap[T];
    },
    clearPayload(tab: TabPath) {
      delete this.payload[tab];
    },
  },
});
