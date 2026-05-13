<script setup lang="ts">
import { useSearchHistoryStore } from '@/stores/searchHistory.ts';
import { triggerSearch } from '@/utils/searchController.ts';
import { CdxButton } from '@wikimedia/codex';

const historyStore = useSearchHistoryStore();

const onClickItem = async (text: string): Promise<void> => {
  await triggerSearch({
    text,
    autoSearch: true,
  });
};
</script>

<template>
  <div class="container">
    <cdx-button
      action="destructive"
      @click="historyStore.clear"
      :disabled="historyStore.items.length === 0"
      class="max-w-full"
    >
      Xóa lịch sử
    </cdx-button>

    <div class="divider--dotted" />

    <div v-if="historyStore.items.length === 0" class="empty">Chưa có lịch sử tra cứu</div>

    <div class="flex flex-col gap-1">
      <button
        v-for="item in historyStore.items"
        :key="item.searchedAt"
        @click="onClickItem(item.text)"
        class="history-item"
      >
        {{ item.text }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-block: 0.5rem;
  padding-inline: 0.625rem;
  overflow-y: auto;
}

.empty {
  text-align: center;
  font-style: italic;
  color: var(--color-subtle);
  margin-top: 0.5rem;
}

.history-item {
  background-color: var(--background-color-base);
  border: 1px solid var(--border-color-base);
  border-radius: 2px;
  padding-block: 0.25rem;
  padding-inline: 0.5rem;
  text-align: left;
  cursor: pointer;
  font-size: var(--font-size-x-small);
  word-wrap: break-word;

  &:hover {
    background-color: light-dark(var(--color-gray-100), var(--color-gray-900));
    border-color: var(--border-color-interactive--hover);
  }
}
</style>
