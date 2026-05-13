<script setup lang="ts">
import { computed } from 'vue';
import { useFieldArray, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/valibot';
import {
  CdxButton,
  CdxChipInput,
  CdxField,
  CdxIcon,
  CdxTextInput,
  type ChipInputItem,
} from '@wikimedia/codex';
import { cdxIconArrowPrevious } from '@wikimedia/codex-icons';
import { useTabNavigation } from '@/composables/useTabNavigation.ts';
import TermTranslationEditor from '@/components/TermTranslationEditor.vue';
import { termFormSchema, type TermFormValues } from '@/schemas/termFormSchema.ts';
import { useUpdateTerm } from '@/composables/useUpdateTerm.ts';
import type { Term } from '@/types/Term.ts';
import { useDeleteTerm } from '@/composables/useDeleteTerm.ts';

const nav = useTabNavigation();
const payload = nav.currentParams<'/term/update'>();
const termEntity = payload.termEntity;

const initialFormValues: TermFormValues = {
  term: termEntity.term,
  aliases: [...termEntity.aliases],
  translations: termEntity.translations.map((translation) => ({
    target: translation.target,
    note: translation.note ?? '',
    references: translation.references.map((reference) =>
      reference.type === 'ref'
        ? {
            type: 'ref' as const,
            id: reference.id,
          }
        : {
            type: 'inline' as const,
            content: reference.content,
            url: reference.url ?? '',
          },
    ),
  })),
};

const { meta, errors, defineField, handleSubmit } = useForm<TermFormValues>({
  validationSchema: toTypedSchema(termFormSchema),
  initialValues: initialFormValues,
});

const [term, termAttrs] = defineField('term');
const [aliases, aliasesAttrs] = defineField('aliases');

const aliasChips = computed<ChipInputItem[]>({
  get: () => (aliases.value ?? []).map((alias) => ({ value: alias })),
  set: (chips) => (aliases.value = chips.map((chip) => String(chip.value).trim()).filter(Boolean)),
});

const {
  fields: translationFields,
  push: pushTranslation,
  remove: removeTranslation,
} = useFieldArray('translations');

const addTranslation = () => pushTranslation({ target: '', note: '', references: [] });

const updateTermApi = useUpdateTerm(termEntity.dictionaryId);
const deleteTermApi = useDeleteTerm(termEntity.dictionaryId);

const onSubmit = handleSubmit(async (values) => {
  const term: Term = {
    term: values.term,
    aliases: values.aliases,
    translations: values.translations.map((translation) => ({
      target: translation.target,
      note: translation.note || undefined,
      references: translation.references.map((ref) =>
        ref.type === 'ref'
          ? ref
          : {
              type: ref.type,
              content: ref.content,
              url: ref.url || undefined,
            },
      ),
    })),
  };

  updateTermApi.mutate({ term, oldTerm: termEntity.term });
});
</script>

<template>
  <div class="container">
    <div class="title">
      <div class="title__text">Sửa mục từ</div>

      <cdx-button
        size="small"
        title="Về trang trước"
        aria-label="Về trang trước"
        @click="
          nav.push('/dictionary/info', {
            dictionaryId: payload.termEntity.dictionaryId,
            tab: 'terms',
          })
        "
      >
        <cdx-icon :icon="cdxIconArrowPrevious" size="small" />
      </cdx-button>
    </div>

    <form class="flex flex-col gap-2" @submit="onSubmit">
      <cdx-field
        :status="errors.term ? 'error' : 'default'"
        :messages="{ error: errors.term }"
        hide-label
        class="hide-help-text"
      >
        <cdx-text-input v-model="term" v-bind="termAttrs" clearable placeholder="Mục từ" />
      </cdx-field>

      <cdx-field
        :status="errors.aliases ? 'error' : 'default'"
        :messages="{ error: errors.aliases }"
        hide-label
        class="hide-help-text"
      >
        <cdx-chip-input
          v-model:input-chips="aliasChips"
          v-bind="aliasesAttrs"
          placeholder="Biến thể (không bắt buộc)"
        />
      </cdx-field>

      <section v-if="translationFields.length > 0" class="flex flex-col gap-2">
        <term-translation-editor
          v-for="(translation, index) in translationFields"
          :key="translation.key"
          :name="`translations[${index}]`"
          :index="index"
          :on-remove-translation="() => removeTranslation(index)"
          :dictionary-id="payload.termEntity.dictionaryId"
        />
      </section>

      <cdx-field
        :status="errors.translations ? 'error' : 'default'"
        :messages="{ error: errors.translations }"
        hide-label
        class="hide-help-text"
      >
        <cdx-button
          :action="errors.translations ? 'destructive' : 'progressive'"
          class="w-full max-w-full"
          @click="addTranslation"
        >
          Thêm bản dịch
        </cdx-button>
      </cdx-field>

      <cdx-button
        action="progressive"
        weight="primary"
        class="max-w-full"
        :disabled="!meta.dirty || !meta.valid || updateTermApi.isLoading.value"
      >
        Sửa mục từ
      </cdx-button>
    </form>

    <div class="divider--dotted" />

    <cdx-button
      action="destructive"
      @click="deleteTermApi.mutate(termEntity.term)"
      :disabled="deleteTermApi.isLoading.value"
      class="max-w-full"
    >
      Xóa mục từ
    </cdx-button>
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

.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px dotted var(--border-color-subtle);
}

.title__text {
  font-weight: bold;
}
</style>
