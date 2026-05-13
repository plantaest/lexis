import { onUnmounted, ref } from 'vue';
import { liveQuery } from 'dexie';

export function useLiveQuery<T>(query: () => Promise<T>, initialValue: T) {
  const data = ref(initialValue);

  const subscription = liveQuery(query).subscribe({
    next: (value) => {
      data.value = value;
    },
  });

  onUnmounted(() => {
    subscription.unsubscribe();
  });

  return data;
}
