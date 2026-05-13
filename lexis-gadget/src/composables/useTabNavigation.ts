import { computed } from 'vue';
import { useTabStore } from '@/stores/tab';
import type { TabPath, TabPayloadMap } from '@/types/Tab.ts';

export function useTabNavigation() {
  const store = useTabStore();

  function push<T extends TabPath>(tab: T, payload?: TabPayloadMap[T]) {
    store.setTab(tab, payload);
  }

  function params<T extends TabPath>(tab: T) {
    return store.getPayload(tab);
  }

  function current() {
    return store.current as TabPath;
  }

  function isActive(tab: TabPath) {
    return computed(() => store.current === tab);
  }

  function clear(tab: TabPath) {
    store.clearPayload(tab);
  }

  function currentParams<T extends TabPath>() {
    return store.getPayload(store.current) as TabPayloadMap[T];
  }

  return {
    push,
    params,
    current,
    isActive,
    clear,
    currentParams,
  };
}
