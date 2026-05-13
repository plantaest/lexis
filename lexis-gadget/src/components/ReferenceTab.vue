<script setup lang="ts">
import { CdxButton, CdxIcon, CdxSearchInput } from '@wikimedia/codex';
import { ref, watch } from 'vue';
import { useTabNavigation } from '@/composables/useTabNavigation.ts';
import type { DictionaryId } from '@/types/Dictionary.ts';
import ReferenceCard from '@/components/ReferenceCard.vue';
import {
  cdxIconMoveFirst,
  cdxIconMoveLast,
  cdxIconNext,
  cdxIconPrevious,
} from '@wikimedia/codex-icons';
import { referenceRepository } from '@/repositories/referenceRepository.ts';
import { usePagination } from '@/composables/usePagination.ts';
import { useDebounceFn } from '@vueuse/core';

const props = defineProps<{
  dictionaryId: DictionaryId;
}>();

const nav = useTabNavigation();

const keywordInput = ref('');

const pagination = usePagination({
  pageSize: 5,
  query: async ({ page, pageSize }) =>
    referenceRepository.searchReferences(props.dictionaryId, keywordInput.value, page, pageSize),
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
          @click="nav.push('/reference/create', { dictionaryId })"
        >
          Thêm tham khảo
        </cdx-button>
        <cdx-button
          class="flex-1 max-w-full"
          action="progressive"
          @click="nav.push('/reference/import', { dictionaryId })"
        >
          Nhập nhanh
        </cdx-button>
      </div>
      <cdx-search-input
        v-model="keywordInput"
        aria-label="Tìm tham khảo"
        placeholder="Tìm tham khảo..."
      />
    </div>

    <div class="flex flex-col gap-2">
      <reference-card
        v-for="reference in pagination.data.value"
        :key="reference.refId"
        :id="reference.refId"
        :content="reference.content"
        :keyword="keywordInput"
        @click="nav.push('/reference/update', { referenceEntity: reference })"
      />
    </div>

    <div v-if="pagination.total.value === 0" class="empty">Không có tham khảo</div>

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
