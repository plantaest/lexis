<script setup lang="ts">
import { cdxIconArrowPrevious } from '@wikimedia/codex-icons';
import { CdxButton, CdxField, CdxIcon, CdxSelect, CdxTextInput } from '@wikimedia/codex';
import { useForm } from 'vee-validate';
import * as v from 'valibot';
import { toTypedSchema } from '@vee-validate/valibot';
import type { Dictionary } from '@/types/Dictionary.ts';
import type { User } from '@/types/User.ts';
import { generateId } from '@/utils/generateId.ts';
import { getNowDate } from '@/utils/getNowDate.ts';
import { useCreateDictionary } from '@/composables/useCreateDictionary.ts';
import { useTabNavigation } from '@/composables/useTabNavigation.ts';

const nav = useTabNavigation();
const payload = nav.currentParams<'/dictionary/create'>();

const dictionaryTypeSelects = [
  { value: 'private', label: 'Cá nhân' },
  { value: 'public', label: 'Cộng đồng' },
];

const languageSelects = [
  { value: 'mul', label: '(mul) Đa ngôn ngữ' },
  { value: 'en', label: '(en) Tiếng Anh' },
  { value: 'vi', label: '(vi) Tiếng Việt' },
];

const formSchema = v.object({
  type: v.picklist(['private', 'public']),
  name: v.pipe(v.string(), v.trim(), v.nonEmpty('Không để trống')),
  englishName: v.pipe(v.string(), v.trim(), v.nonEmpty('Không để trống')),
  sourceLanguage: v.pipe(v.string(), v.nonEmpty('Không để trống')),
  targetLanguage: v.pipe(v.string(), v.nonEmpty('Không để trống')),
});

type FormValues = v.InferInput<typeof formSchema>;

const initialFormValues: FormValues = {
  type: payload.dictionaryType ?? 'public',
  name: '',
  englishName: '',
  sourceLanguage: '',
  targetLanguage: '',
};

const { meta, errors, defineField, handleSubmit } = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: initialFormValues,
});

const [type, typeAttrs] = defineField('type');
const [name, nameAttrs] = defineField('name');
const [englishName, englishNameAttrs] = defineField('englishName');
const [sourceLanguage, sourceLanguageAttrs] = defineField('sourceLanguage');
const [targetLanguage, targetLanguageAttrs] = defineField('targetLanguage');

const createDictionaryApi = useCreateDictionary();

const onSubmit = handleSubmit((values) => {
  const creator: User = {
    id: mw.config.get('wgUserId')!,
    name: mw.config.get('wgUserName')!,
  };

  const now = getNowDate();

  const dictionary: Dictionary = {
    id: `Lexis.Dict.${values.type === 'private' ? 'Private' : 'Public'}.${generateId()}`,
    creator: creator,
    contributors: [creator],
    createdAt: now,
    updatedAt: now,
    type: values.type,
    name: values.name,
    englishName: values.englishName,
    sourceLanguage: values.sourceLanguage,
    targetLanguage: values.targetLanguage,
  };

  createDictionaryApi.mutate(dictionary);
});
</script>

<template>
  <div class="container">
    <div class="title">
      <div class="title__text">Tạo từ điển</div>
      <cdx-button
        size="small"
        title="Về trang trước"
        aria-label="Về trang trước"
        @click="nav.push('/dictionary/list')"
      >
        <cdx-icon :icon="cdxIconArrowPrevious" size="small" />
      </cdx-button>
    </div>

    <form class="form" @submit="onSubmit">
      <cdx-field disabled>
        <template #label>Loại từ điển</template>
        <!-- @vue-ignore -->
        <cdx-select
          class="w-full"
          default-label="Chọn loại từ điển"
          :menu-items="dictionaryTypeSelects"
          v-model:selected="type"
          v-bind="typeAttrs"
        />
      </cdx-field>
      <cdx-field :status="errors.name ? 'error' : 'default'" :messages="{ error: errors.name }">
        <template #label>Tên từ điển</template>
        <cdx-text-input clearable v-model="name" v-bind="nameAttrs" />
      </cdx-field>
      <cdx-field
        :status="errors.englishName ? 'error' : 'default'"
        :messages="{ error: errors.englishName }"
      >
        <template #label>Tên từ điển (tiếng Anh)</template>
        <cdx-text-input clearable v-model="englishName" v-bind="englishNameAttrs" />
      </cdx-field>
      <cdx-field
        :status="errors.sourceLanguage ? 'error' : 'default'"
        :messages="{ error: errors.sourceLanguage }"
      >
        <template #label>Ngôn ngữ gốc</template>
        <!-- @vue-ignore -->
        <cdx-select
          class="w-full"
          default-label="Chọn ngôn ngữ"
          :menu-items="languageSelects"
          v-model:selected="sourceLanguage"
          v-bind="sourceLanguageAttrs"
        />
      </cdx-field>
      <cdx-field
        :status="errors.targetLanguage ? 'error' : 'default'"
        :messages="{ error: errors.targetLanguage }"
      >
        <template #label>Ngôn ngữ đích</template>
        <!-- @vue-ignore -->
        <cdx-select
          class="w-full"
          default-label="Chọn ngôn ngữ"
          :menu-items="languageSelects"
          v-model:selected="targetLanguage"
          v-bind="targetLanguageAttrs"
        />
      </cdx-field>

      <cdx-button
        action="progressive"
        weight="primary"
        class="max-w-full"
        :disabled="!meta.dirty || !meta.valid || createDictionaryApi.isLoading.value"
      >
        Tạo từ điển
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
