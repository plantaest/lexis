<script setup lang="ts">
import { useField, useFieldArray } from 'vee-validate';
import TermReferenceEditor from '@/components/TermReferenceEditor.vue';
import { CdxButton, CdxField, CdxIcon, CdxTextInput } from '@wikimedia/codex';
import { cdxIconLanguage } from '@wikimedia/codex-icons';
import type { DictionaryId } from '@/types/Dictionary.ts';

const props = defineProps<{
  name: string;
  index: number;
  onRemoveTranslation: () => void;
  dictionaryId: DictionaryId;
}>();

const targetField = useField<string>(() => `${props.name}.target`);
const noteField = useField<string>(() => `${props.name}.note`);

const {
  fields: referenceFields,
  push: pushReference,
  remove: removeReference,
} = useFieldArray(() => `${props.name}.references`);

const addRefReference = () => pushReference({ type: 'ref', id: '' });
</script>

<template>
  <div class="translation-wrapper">
    <div class="translation-header">
      <div class="translation-title">
        <cdx-icon :icon="cdxIconLanguage" size="small" />
        <span>Bản dịch {{ index + 1 }}</span>
      </div>
      <div class="translation-buttons">
        <cdx-button
          action="progressive"
          weight="quiet"
          size="small"
          aria-label="Thêm tham khảo"
          @click="addRefReference"
        >
          Thêm tham khảo
        </cdx-button>
        <cdx-button
          action="destructive"
          weight="quiet"
          size="small"
          aria-label="Xóa bản dịch"
          @click="onRemoveTranslation"
        >
          Xóa
        </cdx-button>
      </div>
    </div>

    <cdx-field
      :status="targetField.errorMessage.value ? 'error' : 'default'"
      :messages="{ error: targetField.errorMessage.value }"
      hide-label
      class="hide-help-text"
    >
      <cdx-text-input
        clearable
        placeholder="Bản dịch"
        :model-value="targetField.value.value"
        @update:model-value="targetField.handleChange"
        @blur="targetField.handleBlur"
      />
    </cdx-field>

    <cdx-field
      :status="noteField.errorMessage.value ? 'error' : 'default'"
      :messages="{ error: noteField.errorMessage.value }"
      hide-label
      class="hide-help-text"
    >
      <cdx-text-input
        clearable
        placeholder="Ghi chú (không bắt buộc)"
        :model-value="noteField.value.value"
        @update:model-value="noteField.handleChange"
        @blur="noteField.handleBlur"
      />
    </cdx-field>

    <div v-if="referenceFields.length > 0" class="flex flex-col gap-2">
      <term-reference-editor
        v-for="(reference, index) in referenceFields"
        :key="reference.key"
        class="reference-item"
        :name="`${name}.references[${index}]`"
        :index="index"
        :on-remove-reference="() => removeReference(index)"
        :dictionary-id="dictionaryId"
      />
    </div>
  </div>
</template>

<style scoped>
.translation-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border: 1px solid var(--border-color-subtle);
  border-radius: 2px;
  padding: 0.5rem;
}

.translation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.translation-title {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}

.translation-buttons {
  display: flex;
  gap: 0.25rem;
}
</style>
