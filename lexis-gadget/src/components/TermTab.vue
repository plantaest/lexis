<script setup lang="ts">
import type { DictionaryId } from '@/types/Dictionary.ts';
import { useTabNavigation } from '@/composables/useTabNavigation.ts';
import { ref, watch } from 'vue';
import { CdxButton, CdxIcon, CdxSearchInput } from '@wikimedia/codex';
import { usePagination } from '@/composables/usePagination.ts';
import { termRepository } from '@/repositories/termRepository.ts';
import { useDebounceFn } from '@vueuse/core';
import {
  cdxIconMoveFirst,
  cdxIconMoveLast,
  cdxIconNext,
  cdxIconPrevious,
} from '@wikimedia/codex-icons';
import TermCard from '@/components/TermCard.vue';

const props = defineProps<{
  dictionaryId: DictionaryId;
}>();

const nav = useTabNavigation();

const keywordInput = ref('');

const pagination = usePagination({
  pageSize: 5,
  query: async ({ page, pageSize }) =>
    termRepository.searchTerms(props.dictionaryId, keywordInput.value, page, pageSize),
});

const reload = useDebounceFn(() => {
  pagination.page.value = 0;
  pagination.reload();
}, 300);

watch(keywordInput, reload);
</script>

<template>
  <div class="tab-wrapper">
    <div class="flex flex-col gap-2">
      <div class="flex gap-2">
        <cdx-button
          class="flex-1 max-w-full"
          action="progressive"
          @click="nav.push('/term/create', { dictionaryId })"
        >
          Thêm mục từ
        </cdx-button>
        <cdx-button class="flex-1 max-w-full" action="progressive">Nhập nhanh</cdx-button>
      </div>
      <cdx-search-input
        v-model="keywordInput"
        aria-label="Tìm mục từ"
        placeholder="Tìm mục từ..."
      />
    </div>

    <div class="flex flex-col gap-2">
      <term-card
        v-for="term in pagination.data.value"
        :key="term.term"
        :term="term.term"
        :aliases="term.aliases.join(', ')"
        :targets="term.translations.map((t) => t.target).join(' · ')"
        :keyword="keywordInput"
        @click="nav.push('/term/update', { termEntity: term })"
      />
    </div>

    <div v-if="pagination.total.value === 0" class="empty">Không có mục từ</div>

    <div v-else class="pagination">
      <div class="pagination__status">
        Trang {{ pagination.page.value + 1 }}/{{ pagination.totalPages }}
      </div>
      <div class="pagination__buttons">
        <cdx-button
          weight="quiet"
          size="small"
          aria-label="Trang đầu"
          @click="pagination.goFirst"
          :disabled="pagination.page.value === 0"
        >
          <cdx-icon :icon="cdxIconMoveFirst" size="small" />
        </cdx-button>
        <cdx-button
          weight="quiet"
          size="small"
          aria-label="Trang trước"
          @click="pagination.goPrev"
          :disabled="!pagination.hasPrev.value"
        >
          <cdx-icon :icon="cdxIconPrevious" size="small" />
        </cdx-button>
        <cdx-button
          weight="quiet"
          size="small"
          aria-label="Trang sau"
          @click="pagination.goNext"
          :disabled="!pagination.hasNext.value"
        >
          <cdx-icon :icon="cdxIconNext" size="small" />
        </cdx-button>
        <cdx-button
          weight="quiet"
          size="small"
          aria-label="Trang cuối"
          @click="pagination.goLast"
          :disabled="pagination.page.value === pagination.totalPages.value - 1"
        >
          <cdx-icon :icon="cdxIconMoveLast" size="small" />
        </cdx-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.empty {
  text-align: center;
  font-style: italic;
  color: var(--color-subtle);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination__status {
  color: var(--color-subtle);
}
</style>
