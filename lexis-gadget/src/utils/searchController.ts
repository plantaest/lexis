import { useSearchStore } from '@/stores/search.ts';
import { useTabNavigation } from '@/composables/useTabNavigation.ts';

export type TriggerSearchOptions = {
  text: string;
  autoSearch?: boolean;
};

export const triggerSearch = async (options: TriggerSearchOptions): Promise<void> => {
  const searchStore = useSearchStore();
  const nav = useTabNavigation();

  searchStore.text = options.text;

  nav.push('/search');

  if (options.autoSearch) {
    await searchStore.search();
  }
};
