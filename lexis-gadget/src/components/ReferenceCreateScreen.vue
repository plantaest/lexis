<script setup lang="ts">
import { cdxIconArrowPrevious } from '@wikimedia/codex-icons';
import { CdxButton, CdxField, CdxIcon, CdxTextInput } from '@wikimedia/codex';
import { useTabNavigation } from '@/composables/useTabNavigation.ts';
import * as v from 'valibot';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/valibot';
import { useCreateReference } from '@/composables/useCreateReference.ts';
import type { Reference } from '@/types/Reference.ts';
import { referenceFormSchema } from '@/schemas/referenceFormSchema.ts';

const nav = useTabNavigation();
const payload = nav.currentParams<'/reference/create'>();

type FormValues = v.InferInput<typeof referenceFormSchema>;

const initialFormValues: FormValues = {
  id: '',
  content: '',
  url: '',
};

const { meta, errors, defineField, handleSubmit } = useForm({
  validationSchema: toTypedSchema(referenceFormSchema),
  initialValues: initialFormValues,
});

const [id, idAttrs] = defineField('id');
const [content, contentAttrs] = defineField('content');
const [url, urlAttrs] = defineField('url');

const createReferenceApi = useCreateReference(payload.dictionaryId);

const onSubmit = handleSubmit((values) => {
  const reference: Reference = {
    id: values.id,
    content: values.content,
    url: values.url || undefined,
  };

  createReferenceApi.mutate(reference);
});
</script>

<template>
  <div class="container">
    <div class="title">
      <div class="title__text">Thêm tham khảo</div>
      <cdx-button
        size="small"
        title="Về trang trước"
        aria-label="Về trang trước"
        @click="nav.push('/dictionary/info', { dictionaryId: payload.dictionaryId, tab: 'refs' })"
      >
        <cdx-icon :icon="cdxIconArrowPrevious" size="small" />
      </cdx-button>
    </div>

    <form class="form" @submit="onSubmit">
      <cdx-field :status="errors.id ? 'error' : 'default'" :messages="{ error: errors.id }">
        <template #label>ID</template>
        <template #help-text>
          Tối đa 5 ký tự, chỉ cho phép ký tự số (0-9), chữ hoa (A-Z), chữ thường (a-z) và dấu gạch
          nối (-).
        </template>
        <cdx-text-input clearable v-model="id" v-bind="idAttrs" />
      </cdx-field>
      <cdx-field
        :status="errors.content ? 'error' : 'default'"
        :messages="{ error: errors.content }"
      >
        <template #label>Nội dung</template>
        <template #help-text>Tối đa 200 ký tự (đang có {{ content?.length }} ký tự)</template>
        <cdx-text-input clearable v-model="content" v-bind="contentAttrs" />
      </cdx-field>
      <cdx-field :status="errors.url ? 'error' : 'default'" :messages="{ error: errors.url }">
        <template #label>URL</template>
        <template #description>Không bắt buộc</template>
        <cdx-text-input clearable v-model="url" v-bind="urlAttrs" />
      </cdx-field>

      <cdx-button
        action="progressive"
        weight="primary"
        class="max-w-full"
        :disabled="!meta.dirty || !meta.valid || createReferenceApi.isLoading.value"
      >
        Thêm tham khảo
      </cdx-button>
    </form>
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

.form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
