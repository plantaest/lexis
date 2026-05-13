<script setup lang="ts">
import { CdxButton } from '@wikimedia/codex';
import { computed, watch } from 'vue';
import { searchService } from '@/utils/searchService.ts';
import SearchResultCard from '@/components/SearchResultCard.vue';
import HighlightedSearchInput from '@/components/HighlightedSearchInput.vue';
import { constants } from '@/utils/constants.ts';
import { useSearchStore } from '@/stores/search.ts';
import { isInitializing } from '@/stores/isInitializing.ts';

const searchStore = useSearchStore();

const results = computed(() => searchStore.results);
const unduplicatedResults = computed(() => searchService.removeDuplicates(results.value));
const highlights = computed(() =>
  results.value.map((result) => ({
    start: result.start,
    end: result.end,
  })),
);

watch(
  () => searchStore.text,
  () => searchStore.reset(),
);
</script>

<template>
  <div class="header">
    <highlighted-search-input
      v-model="searchStore.text"
      :highlights="highlights"
      :rows="6"
      :maxlength="1000"
      placeholder="Nhập văn bản cần tra cứu..."
      @ctrl-enter="searchStore.search"
    />
    <cdx-button
      action="progressive"
      weight="primary"
      class="max-w-full"
      @click="searchStore.search"
      :disabled="isInitializing"
    >
      {{ isInitializing ? 'Đang tải...' : 'Tra cứu' }}
    </cdx-button>
  </div>

  <div class="results">
    <search-result-card
      v-for="(result, index) in unduplicatedResults"
      :key="`${result.term.dictionaryId}-${result.term.term}-${result.start}`"
      :index="index"
      :result="result"
    />
  </div>

  <div class="footer">
    <div>{{ unduplicatedResults.length }} kết quả</div>
    <div>{{ searchStore.text.length }}/{{ constants.maxSearchInputLength }} ký tự</div>
  </div>
</template>

<style scoped>
.header,
.results,
.footer {
  padding-block: 0.5rem;
  padding-inline: 0.625rem;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border-color-subtle);
}

.results {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  overflow-y: scroll;
  scrollbar-width: thin;
}

.footer {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid var(--border-color-subtle);
  font-size: 0.75rem;
  color: var(--color-subtle);
}
</style>
