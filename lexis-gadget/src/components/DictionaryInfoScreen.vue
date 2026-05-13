<script setup lang="ts">
import {
  cdxIconArrowPrevious,
  cdxIconEllipsis,
  cdxIconEye,
  cdxIconLiteral,
  cdxIconTrash,
} from '@wikimedia/codex-icons';
import {
  CdxButton,
  CdxIcon,
  CdxInfoChip,
  CdxMenuButton,
  CdxProgressBar,
  CdxTab,
  CdxTabs,
  type MenuButtonItemData,
} from '@wikimedia/codex';
import { useTabNavigation } from '@/composables/useTabNavigation.ts';
import DictionaryInfoDetail from '@/components/DictionaryInfoDetail.vue';
import { useGetOneDictionary } from '@/composables/useGetOneDictionary.ts';
import { useUserConfigStore } from '@/stores/userConfig.ts';
import { useToggleDictionary } from '@/composables/useToggleDictionary.ts';
import { useUnsaveDictionary } from '@/composables/useUnsaveDictionary.ts';
import ReferenceTab from '@/components/ReferenceTab.vue';
import { getDictionaryTypeFromId } from '@/utils/getDictionaryTypeFromId.ts';
import { ref } from 'vue';
import { toReadableDate } from '@/utils/toReadableDate.ts';
import TermTab from '@/components/TermTab.vue';

const nav = useTabNavigation();
const payload = nav.currentParams<'/dictionary/info'>();
const dictionaryType = getDictionaryTypeFromId(payload.dictionaryId);

const currentTab = ref(payload.tab ? payload.tab : 'info');

const userConfigStore = useUserConfigStore();

const tabsData = [
  { name: 'info', label: 'Thông tin' },
  { name: 'refs', label: 'Tham khảo' },
  { name: 'terms', label: 'Mục từ' },
];

const { data: dictionary, isPending } = useGetOneDictionary(payload.dictionaryId);
const toggleDictionaryApi = useToggleDictionary();
const unsaveDictionaryApi = useUnsaveDictionary();

const menuItems: MenuButtonItemData[] = [
  {
    label: 'Sửa thông tin từ điển',
    value: 'update-dictionary',
    icon: cdxIconLiteral,
  },
  {
    label: 'Bật/Tắt kích hoạt từ điển',
    value: 'toggle-dictionary',
    icon: cdxIconEye,
  },
  {
    label: 'Bỏ lưu từ điển này',
    value: 'unsave-dictionary',
    icon: cdxIconTrash,
    action: dictionaryType === 'public' ? 'destructive' : undefined,
    disabled: dictionaryType === 'private',
  },
];

const onSelect = (newSelection: string) => {
  if (newSelection === 'update-dictionary') {
    nav.push('/dictionary/update', { dictionary: dictionary.value! });
  }

  if (newSelection === 'toggle-dictionary') {
    toggleDictionaryApi.mutate(payload.dictionaryId);
  }

  if (newSelection === 'unsave-dictionary') {
    unsaveDictionaryApi.mutate(payload.dictionaryId);
  }
};
</script>

<template>
  <cdx-progress-bar v-if="isPending" inline aria-label="Indeterminate progress bar" />

  <div v-else class="container">
    <div class="title">
      <div class="title__text">{{ dictionary?.name }}</div>
      <div class="title__buttons">
        <cdx-menu-button
          size="small"
          weight="primary"
          :selected="null"
          :menu-items="menuItems"
          aria-label="Tùy chọn"
          @update:selected="onSelect"
        >
          <cdx-icon :icon="cdxIconEllipsis" size="small" />
        </cdx-menu-button>
        <cdx-button
          size="small"
          title="Về trang trước"
          aria-label="Về trang trước"
          @click="nav.push('/dictionary/list')"
        >
          <cdx-icon :icon="cdxIconArrowPrevious" size="small" />
        </cdx-button>
      </div>
    </div>

    <cdx-tabs :active="currentTab" @update:active="(value) => (currentTab = value)">
      <cdx-tab v-for="tab in tabsData" :key="tab.name" :name="tab.name" :label="tab.label">
        <template v-if="tab.name === 'info'">
          <div class="details">
            <dictionary-info-detail name="Trạng thái">
              <cdx-info-chip
                v-if="
                  dictionary &&
                  userConfigStore[
                    dictionaryType === 'private'
                      ? 'privateDictionaryEnabled'
                      : 'publicDictionaryEnabled'
                  ][dictionary.id]
                "
                status="success"
              >
                Đang kích hoạt
              </cdx-info-chip>
              <cdx-info-chip v-else status="warning">Không kích hoạt</cdx-info-chip>
            </dictionary-info-detail>
            <dictionary-info-detail name="ID">
              <span class="font-mono">{{ dictionary?.id }}</span>
            </dictionary-info-detail>
            <dictionary-info-detail name="Người tạo">
              {{ dictionary?.creator.name }}
            </dictionary-info-detail>
            <dictionary-info-detail name="Người đóng góp">
              {{ dictionary?.contributors.map((c) => c.name).join(', ') }}
            </dictionary-info-detail>
            <dictionary-info-detail name="Ngày tạo">
              {{ dictionary ? toReadableDate(dictionary.createdAt) : 'N/A' }}
            </dictionary-info-detail>
            <dictionary-info-detail name="Ngày cập nhật">
              {{ dictionary ? toReadableDate(dictionary.updatedAt) : 'N/A' }}
            </dictionary-info-detail>
            <dictionary-info-detail name="Loại từ điển">
              {{
                dictionary?.type === 'private'
                  ? 'Cá nhân'
                  : dictionary?.type === 'public'
                    ? 'Cộng đồng'
                    : 'N/A'
              }}
            </dictionary-info-detail>
            <dictionary-info-detail name="Tên từ điển">
              {{ dictionary?.name }}
            </dictionary-info-detail>
            <dictionary-info-detail name="Tên từ điển (tiếng Anh)">
              {{ dictionary?.englishName }}
            </dictionary-info-detail>
            <dictionary-info-detail name="Ngôn ngữ gốc">
              {{ dictionary?.sourceLanguage }}
            </dictionary-info-detail>
            <dictionary-info-detail name="Ngôn ngữ đích">
              {{ dictionary?.targetLanguage }}
            </dictionary-info-detail>
          </div>
        </template>
        <template v-if="tab.name === 'refs'">
          <reference-tab v-if="dictionary" :dictionary-id="dictionary.id" />
        </template>
        <template v-if="tab.name === 'terms'">
          <term-tab v-if="dictionary" :dictionary-id="dictionary.id" />
        </template>
      </cdx-tab>
    </cdx-tabs>
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
  height: 100%;
}

.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title__text {
  font-weight: bold;
}

.title__buttons {
  display: flex;
  gap: 0.5rem;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
}
</style>
