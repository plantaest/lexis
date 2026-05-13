<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useField } from 'vee-validate';
import {
  CdxButton,
  CdxField,
  CdxIcon,
  CdxLookup,
  CdxTextInput,
  type MenuItemData,
} from '@wikimedia/codex';
import { cdxIconBookmark, cdxIconReference } from '@wikimedia/codex-icons';
import { referenceRepository } from '@/repositories/referenceRepository.ts';
import type { DictionaryId } from '@/types/Dictionary.ts';

const props = defineProps<{
  name: string;
  index: number;
  onRemoveReference: () => void;
  dictionaryId: DictionaryId;
}>();

const typeField = useField<string>(() => `${props.name}.type`);
const idField = useField<string>(() => `${props.name}.id`);
const contentField = useField<string>(() => `${props.name}.content`);
const urlField = useField<string>(() => `${props.name}.url`);

const isRef = computed(() => typeField.value.value === 'ref');

const onClick = () => {
  if (isRef.value) {
    typeField.value.value = 'inline';
    contentField.value.value = '';
    urlField.value.value = '';
  } else {
    typeField.value.value = 'ref';
    idField.value.value = '';
  }
};

const selectedItem = computed({
  get: () => idField.value.value || null,
  set: (value) => idField.setValue(value?.toString() ?? ''),
});
const inputValue = ref('');
const menuItems = ref<MenuItemData[]>([]);

const fetchAndTransformFn = async () =>
  (
    await referenceRepository.searchReferences(props.dictionaryId, inputValue.value, 0, 5)
  ).items.map((item) => ({
    value: item.refId,
    supportingText: item.content,
  }));

const onUpdateInputValue = async (value: string) => {
  if (!value) {
    menuItems.value = [];
    return;
  }

  if (inputValue.value !== value) {
    return;
  }

  const items = await fetchAndTransformFn();

  if (items.length === 0) {
    menuItems.value = [];
    return;
  }

  menuItems.value = items;
};

onMounted(() => {
  if (idField.value.value) {
    inputValue.value = idField.value.value;
    onUpdateInputValue(idField.value.value);
  }
});
</script>

<template>
  <div class="reference-wrapper">
    <div class="reference-header">
      <div class="reference-title">
        <cdx-icon :icon="cdxIconReference" size="small" />
        <span>Tham khảo {{ index + 1 }}</span>
      </div>
      <div class="reference-buttons">
        <cdx-button
          action="progressive"
          :weight="isRef ? 'quiet' : 'primary'"
          size="small"
          aria-label="Bật/Tắt nhập riêng tham khảo"
          @click="onClick"
        >
          Nhập riêng
        </cdx-button>
        <cdx-button
          action="destructive"
          weight="quiet"
          size="small"
          aria-label="Xóa tham khảo"
          @click="onRemoveReference"
        >
          Xóa
        </cdx-button>
      </div>
    </div>

    <template v-if="isRef">
      <cdx-field
        :status="idField.errorMessage.value ? 'error' : 'default'"
        :messages="{ error: idField.errorMessage.value }"
        hide-label
        class="hide-help-text"
      >
        <cdx-lookup
          v-model:selected="selectedItem"
          v-model:input-value="inputValue"
          :menu-items="menuItems"
          :menu-config="{ boldLabel: true }"
          @input="onUpdateInputValue"
          @blur="idField.handleBlur"
          aria-label="Tìm tham khảo"
          placeholder="ID tham khảo"
          :start-icon="cdxIconBookmark"
        >
          <template #no-results>Không tìm thấy tham khảo</template>
        </cdx-lookup>
      </cdx-field>
    </template>

    <template v-else>
      <cdx-field
        :status="contentField.errorMessage.value ? 'error' : 'default'"
        :messages="{ error: contentField.errorMessage.value }"
        hide-label
        class="hide-help-text"
      >
        <cdx-text-input
          clearable
          placeholder="Nội dung"
          :model-value="contentField.value.value"
          @update:model-value="contentField.handleChange"
          @blur="contentField.handleBlur"
        />
      </cdx-field>

      <cdx-field
        :status="urlField.errorMessage.value ? 'error' : 'default'"
        :messages="{ error: urlField.errorMessage.value }"
        hide-label
        class="hide-help-text"
      >
        <cdx-text-input
          clearable
          placeholder="URL (không bắt buộc)"
          :model-value="urlField.value.value"
          @update:model-value="urlField.handleChange"
          @blur="urlField.handleBlur"
        />
      </cdx-field>
    </template>
  </div>
</template>

<style scoped>
.reference-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border: 1px solid var(--border-color-subtle);
  border-radius: 2px;
  padding: 0.5rem;
}

.reference-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.reference-title {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}

.reference-buttons {
  display: flex;
  gap: 0.25rem;
}
</style>
