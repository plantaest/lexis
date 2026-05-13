<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { LdfHelper } from '@/utils/LdfHelper';
import type { Reference } from '@/types/Reference';
import { CdxButton, CdxIcon, CdxPopover, CdxTextArea, CdxToggleButton } from '@wikimedia/codex';
import { cdxIconArrowPrevious } from '@wikimedia/codex-icons';
import { useTabNavigation } from '@/composables/useTabNavigation.ts';
import type { ImportItem } from '@/types/ImportItem.ts';
import { referenceRepository } from '@/repositories/referenceRepository.ts';
import { useImportReference } from '@/composables/useImportReference.ts';
import * as v from 'valibot';
import { referenceFormSchema } from '@/schemas/referenceFormSchema.ts';
import { truncateString } from '@/utils/truncateString.ts';
import { formatIssues } from '@/utils/formatIssues.ts';

const nav = useTabNavigation();
const payload = nav.currentParams<'/reference/import'>();

const input = ref('');
const items = ref<ImportItem<Reference>[]>([]);
const triggerElement = ref();
const showPopover = ref(false);

const parse = async (line: string) => {
  const data = LdfHelper.parseReference(line);
  const schemaParsed = v.safeParse(referenceFormSchema, {
    id: data.id,
    content: data.content,
    url: data.url || '',
  });

  if (!schemaParsed.success) {
    throw new Error(`Unsatisfied schema: ${formatIssues(schemaParsed.issues)}`);
  }

  const isDuplicated = await referenceRepository.hasReference(payload.dictionaryId, data.id);

  if (isDuplicated) {
    throw new Error(`Duplicated used ID: ${data.id}`);
  }

  return data;
};

const validate = async () => {
  const lines = input.value.split('\n').map((l) => l.trim());

  const seen = new Set<string>();
  const results: ImportItem<Reference>[] = [];

  for (const [index, line] of lines.entries()) {
    if (line.trim() === '') {
      continue;
    }

    let valid = false;
    let data: Reference | null = null;
    let error: { message: string } | null = null;

    try {
      data = await parse(line);
      valid = true;
    } catch (e: unknown) {
      if (e instanceof Error) {
        error = { message: e.message || 'Invalid LDF' };
        valid = false;
      }
    }

    let item: ImportItem<Reference> = valid
      ? { line, index, valid, data: data! }
      : { line, index, valid, error: error! };

    if (item.valid && seen.has(item.data.id)) {
      item = {
        ...item,
        valid: false,
        error: { message: `Duplicated ID: ${item.data.id}` },
      };
    }

    if (item.valid) {
      seen.add(item.data.id);
    }

    results.push(item);
  }

  items.value = results;
};

const errorItems = computed(() => items.value.filter((i) => !i.valid));
const canImport = computed(() => items.value.length > 0 && errorItems.value.length === 0);

const importReferenceApi = useImportReference(payload.dictionaryId);

const commit = async () => {
  if (!canImport.value) {
    return;
  }

  const references: Reference[] = [];

  for (const item of items.value) {
    if (item.valid) {
      references.push(item.data);
    }
  }

  await importReferenceApi.mutateAsync(references);

  input.value = '';
  items.value = [];
};

watch(input, () => {
  if (canImport.value) {
    items.value = [];
  }
});
</script>

<template>
  <div class="container">
    <div class="title">
      <div class="font-bold">Nhập nhanh tham khảo</div>
      <cdx-button
        size="small"
        title="Về trang trước"
        aria-label="Về trang trước"
        @click="nav.push('/dictionary/info', { dictionaryId: payload.dictionaryId, tab: 'refs' })"
      >
        <cdx-icon :icon="cdxIconArrowPrevious" size="small" />
      </cdx-button>
    </div>

    <!-- !!! TEMPORARY !!! -->
    <cdx-text-area v-model="input" placeholder="<id>:<content>:<?url>" class="textarea" disabled />

    <div class="flex gap-2">
      <cdx-button class="flex-1 max-w-full" @click="validate" :disabled="!input.trim()"
        >Kiểm tra</cdx-button
      >
      <cdx-toggle-button
        ref="triggerElement"
        v-model="showPopover"
        class="flex-1 max-w-full"
        :disabled="errorItems.length === 0"
      >
        Xem lỗi ({{ errorItems.length }})
      </cdx-toggle-button>
      <cdx-button
        class="flex-1 max-w-full"
        action="progressive"
        weight="primary"
        :disabled="!canImport || importReferenceApi.isLoading.value"
        @click="commit"
      >
        Nhập
      </cdx-button>
    </div>
  </div>

  <cdx-popover
    v-model:open="showPopover"
    :anchor="triggerElement"
    placement="top"
    :title="`${errorItems.length} lỗi`"
    :use-close-button="true"
  >
    <div class="error-items">
      <div class="error-item" v-for="errorItem in errorItems" :key="errorItem.index">
        <div class="error-item__index font-bold">Dòng {{ errorItem.index + 1 }}</div>
        <div class="error-item__error-message">{{ errorItem.error?.message }}</div>
        <div class="error-item__line">{{ truncateString(errorItem.line) }}</div>
      </div>
    </div>
  </cdx-popover>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-block: 0.5rem;
  padding-inline: 0.625rem;
  overflow-y: auto;
  height: 100%;
}

.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px dotted var(--border-color-subtle);
}

.textarea {
  height: 100%;

  & :deep(textarea) {
    height: 100%;
    font-family: monospace;
  }
}

.error-items {
  width: 290px;
  max-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border: 1px solid var(--border-color-destructive, #f54739);
  border-radius: 2px;
  padding: 0.25rem;
  overflow-y: auto;
  scrollbar-width: thin;
  word-wrap: break-word;
}

.error-item {
  display: flex;
  flex-direction: column;
  padding: 0.25rem;
  background-color: var(--background-color-destructive-subtle, #ffe9e5);
  font-size: var(--font-size-x-small);
  line-height: 1.3;
  border-radius: 2px;
}

.error-item__error-message {
  color: var(--color-destructive, #bf3c2c);
}

.error-item__line {
  font-family: monospace;
}
</style>
