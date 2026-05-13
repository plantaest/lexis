import { computed, ref, watch } from 'vue';

type PaginationQuery<T> = (args: { page: number; pageSize: number }) => Promise<{
  items: T[];
  total: number;
}>;

export function usePagination<T>(options: { pageSize: number; query: PaginationQuery<T> }) {
  const page = ref(0);
  const pageSize = options.pageSize;
  const data = ref<T[]>([]);
  const total = ref(0);
  const totalPages = computed(() => Math.ceil(total.value / pageSize));
  const hasPrev = computed(() => page.value > 0);
  const hasNext = computed(() => page.value < totalPages.value - 1);

  async function load() {
    const response = await options.query({
      page: page.value,
      pageSize,
    });
    data.value = response.items;
    total.value = response.total;
  }

  function goFirst() {
    page.value = 0;
  }

  function goPrev() {
    if (page.value > 0) {
      page.value--;
    }
  }

  function goNext() {
    if (page.value < totalPages.value - 1) {
      page.value++;
    }
  }

  function goLast() {
    page.value = totalPages.value - 1;
  }

  watch(page, load, { immediate: true });

  return {
    page,
    pageSize,
    data,
    total,
    totalPages,
    hasPrev,
    hasNext,
    goFirst,
    goPrev,
    goNext,
    goLast,
    reload: load,
  };
}
