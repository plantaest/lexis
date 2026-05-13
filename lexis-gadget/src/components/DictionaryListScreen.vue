<script setup lang="ts">
import { CdxButton, CdxIcon, CdxMessage, CdxProgressBar } from '@wikimedia/codex';
import { cdxIconAdd } from '@wikimedia/codex-icons';
import { useTabNavigation } from '@/composables/useTabNavigation.ts';
import { useUserConfigStore } from '@/stores/userConfig.ts';
import { useGetListDictionaryByIds } from '@/composables/useGetListDictionaryByIds.ts';
import DictionaryCard from '@/components/DictionaryCard.vue';
import { constants } from '@/utils/constants.ts';
import SaveDictionaryForm from '@/components/SaveDictionaryForm.vue';
import { computed } from 'vue';

const nav = useTabNavigation();
const userConfigStore = useUserConfigStore();

const privateDictionaryIds = computed(() => userConfigStore.privateDictionaryIds);
const publicDictionaryIds = computed(() => userConfigStore.publicDictionaryIds);

const { data: privateDictionaries, isPending: isPendingPrivateDictionaries } =
  useGetListDictionaryByIds('private', privateDictionaryIds);
const { data: publicDictionaries, isPending: isPendingPublicDictionaries } =
  useGetListDictionaryByIds('public', publicDictionaryIds);

const isPending = isPendingPrivateDictionaries || isPendingPublicDictionaries;
</script>

<template>
  <cdx-progress-bar v-if="isPending" inline aria-label="Indeterminate progress bar" />

  <div v-else class="container">
    <div class="title">
      <div class="title__text">Từ điển cá nhân</div>
      <cdx-button
        size="small"
        title="Tạo từ điển cá nhân"
        aria-label="Tạo từ điển cá nhân"
        @click="nav.push('/dictionary/create', { dictionaryType: 'private' })"
        :disabled="userConfigStore.privateDictionaryIds.length >= constants.maxPrivateDictionaries"
      >
        <cdx-icon :icon="cdxIconAdd" size="small" />
      </cdx-button>
    </div>

    <cdx-message v-if="userConfigStore.privateDictionaryIds.length === 0">
      Không có từ điển cá nhân
    </cdx-message>

    <template v-if="userConfigStore.privateDictionaryIds.length > 0">
      <dictionary-card
        v-for="dictionary in privateDictionaries"
        :key="dictionary.id"
        :title="dictionary.name"
        :updated-at="dictionary.updatedAt"
        :enabled="userConfigStore.privateDictionaryEnabled[dictionary.id]"
        @click="nav.push('/dictionary/info', { dictionaryId: dictionary.id })"
      />
    </template>

    <div class="title">
      <div class="title__text">Từ điển cộng đồng</div>
      <cdx-button
        size="small"
        title="Tạo từ điển cộng đồng"
        aria-label="Tạo từ điển cộng đồng"
        @click="nav.push('/dictionary/create', { dictionaryType: 'public' })"
        :disabled="userConfigStore.publicDictionaryIds.length >= constants.maxPublicDictionaries"
      >
        <cdx-icon :icon="cdxIconAdd" size="small" />
      </cdx-button>
    </div>

    <save-dictionary-form />

    <cdx-message v-if="userConfigStore.publicDictionaryIds.length === 0">
      Truy cập
      <a href="https://vi.wikipedia.org/wiki/Wikipedia:Lexis" target="_blank">Wikipedia:Lexis</a> để
      tìm ID các từ điển cộng đồng và lưu lại để dùng (tối đa
      {{ constants.maxPublicDictionaries }} từ điển)
    </cdx-message>

    <template v-if="userConfigStore.publicDictionaryIds.length > 0">
      <dictionary-card
        v-for="dictionary in publicDictionaries"
        :key="dictionary.id"
        :title="dictionary.name"
        :updated-at="dictionary.updatedAt"
        :enabled="userConfigStore.publicDictionaryEnabled[dictionary.id]"
        @click="nav.push('/dictionary/info', { dictionaryId: dictionary.id })"
      />
    </template>
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
}

.title__text {
  font-weight: bold;
}
</style>
