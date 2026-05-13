<script setup lang="ts">
import { useTabNavigation } from '@/composables/useTabNavigation.ts';
import * as v from 'valibot';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/valibot';
import { cdxIconArrowPrevious } from '@wikimedia/codex-icons';
import { CdxButton, CdxField, CdxIcon, CdxTextInput } from '@wikimedia/codex';
import type { Reference } from '@/types/Reference.ts';
import { useUpdateReference } from '@/composables/useUpdateReference.ts';
import { useDeleteReference } from '@/composables/useDeleteReference.ts';
import { referenceFormSchema } from '@/schemas/referenceFormSchema.ts';

const nav = useTabNavigation();
const payload = nav.currentParams<'/reference/update'>();
const referenceEntity = payload.referenceEntity;

type FormValues = v.InferInput<typeof referenceFormSchema>;

const initialFormValues: FormValues = {
  id: referenceEntity.refId,
  content: referenceEntity.content,
  url: referenceEntity.url ?? '',
};

const { meta, errors, defineField, handleSubmit } = useForm({
  validationSchema: toTypedSchema(referenceFormSchema),
  initialValues: initialFormValues,
});

const [id, idAttrs] = defineField('id');
const [content, contentAttrs] = defineField('content');
const [url, urlAttrs] = defineField('url');

const updateReferenceApi = useUpdateReference(referenceEntity.dictionaryId);
const deleteReferenceApi = useDeleteReference(referenceEntity.dictionaryId);

const onSubmit = handleSubmit((values) => {
  const reference: Reference = {
    id: referenceEntity.refId,
    content: values.content,
    url: values.url || undefined,
  };

  updateReferenceApi.mutate(reference);
});
</script>

<template>
  <div class="container">
    <div class="title">
      <div class="title__text">Sửa tham khảo</div>
      <cdx-button
        size="small"
        title="Về trang trước"
        aria-label="Về trang trước"
        @click="
          nav.push('/dictionary/info', {
            dictionaryId: payload.referenceEntity.dictionaryId,
            tab: 'refs',
          })
        "
      >
        <cdx-icon :icon="cdxIconArrowPrevious" size="small" />
      </cdx-button>
    </div>

    <form class="form" @submit="onSubmit">
      <cdx-field :status="errors.id ? 'error' : 'default'" :messages="{ error: errors.id }">
        <template #label>ID</template>
        <cdx-text-input clearable v-model="id" v-bind="idAttrs" disabled />
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
        :disabled="!meta.dirty || !meta.valid || updateReferenceApi.isLoading.value"
      >
        Sửa tham khảo
      </cdx-button>
    </form>

    <div class="divider--dotted" />

    <cdx-button
      action="destructive"
      @click="deleteReferenceApi.mutate(referenceEntity.refId)"
      :disabled="deleteReferenceApi.isLoading.value"
      class="max-w-full"
    >
      Xóa tham khảo
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

.form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
