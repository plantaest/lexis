<script setup lang="ts">
import { constants } from '@/utils/constants.ts';
import { CdxSearchInput } from '@wikimedia/codex';
import { useUserConfigStore } from '@/stores/userConfig.ts';
import { useSaveDictionary } from '@/composables/useSaveDictionary.ts';
import { ref } from 'vue';
import type { DictionaryId } from '@/types/Dictionary.ts';
import { isLexisDictionaryId } from '@/utils/isLexisDictionaryId.ts';
import { getDictionaryTypeFromId } from '@/utils/getDictionaryTypeFromId.ts';

const userConfigStore = useUserConfigStore();

const saveDictionaryApi = useSaveDictionary();

const dictionaryIdInput = ref('');

const onSubmit = async function (dictionaryId: DictionaryId) {
  if (dictionaryId.trim() === '') {
    mw.notify('Không để trống nội dung trường', { type: 'error' });
    return;
  }

  if (!isLexisDictionaryId(dictionaryId)) {
    mw.notify('ID từ điển không đúng tiêu chuẩn', { type: 'error' });
    return;
  }

  if (getDictionaryTypeFromId(dictionaryId) === 'private') {
    mw.notify('Không được lưu từ điển cá nhân', { type: 'error' });
    return;
  }

  if (userConfigStore.publicDictionaryIds.includes(dictionaryId)) {
    mw.notify(`Từ điển với ID ${dictionaryId} đã được lưu`, { type: 'error' });
    return;
  }

  await saveDictionaryApi.mutateAsync(dictionaryId);
  dictionaryIdInput.value = '';
};
</script>

<template>
  <cdx-search-input
    use-button
    button-label="Lưu"
    aria-label="Nhập ID từ điển"
    placeholder="Nhập ID từ điển..."
    :disabled="
      userConfigStore.publicDictionaryIds.length >= constants.maxPublicDictionaries ||
      saveDictionaryApi.isLoading.value
    "
    v-model="dictionaryIdInput"
    @submit-click="onSubmit"
  />
</template>
