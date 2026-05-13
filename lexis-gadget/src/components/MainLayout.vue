<script setup lang="ts">
import {
  FloatingPanelBody,
  FloatingPanelCloseTrigger,
  FloatingPanelContent,
  FloatingPanelControl,
  FloatingPanelDragTrigger,
  FloatingPanelHeader,
  FloatingPanelPositioner,
  FloatingPanelResizeTrigger,
  FloatingPanelRoot,
  type FloatingPanelRootProps,
  FloatingPanelTrigger,
} from '@ark-ui/vue/floating-panel';
import { CdxButton, CdxIcon } from '@wikimedia/codex';
import {
  cdxIconClose,
  cdxIconHistory,
  cdxIconInfo,
  cdxIconReferences,
  cdxIconSearch,
} from '@wikimedia/codex-icons';
import { useTabNavigation } from '@/composables/useTabNavigation.ts';
import { tabs } from '@/types/Tab.ts';
import { computed, watch } from 'vue';
import { registerCopySearch } from '@/utils/registerCopySearch.ts';
import { useUserConfigStore } from '@/stores/userConfig.ts';
import { showPanel } from '@/stores/showPanel.ts';
import { syncDictionaries } from '@/utils/syncDictionaries.ts';
import { isInitializing } from '@/stores/isInitializing.ts';

const defaultSize = { width: 375, height: 555 };

const getAnchorPosition: FloatingPanelRootProps['getAnchorPosition'] = ({ boundaryRect }) =>
  boundaryRect
    ? {
        x: boundaryRect.width - (defaultSize.width + 10),
        y: boundaryRect.height - (defaultSize.height + 10),
      }
    : { x: 10, y: 10 };

const nav = useTabNavigation();
const currentTab = computed(() => nav.current());
const currentTabContent = computed(() => tabs[currentTab.value]);

const userConfigStore = useUserConfigStore();

watch(
  showPanel,
  async (newVal) => {
    if (!newVal) {
      return;
    }

    isInitializing.value = true;

    try {
      await userConfigStore.initialize();
      await syncDictionaries([
        ...userConfigStore.privateDictionaryIds,
        ...userConfigStore.publicDictionaryIds,
      ]);
      registerCopySearch();
    } finally {
      isInitializing.value = false;
    }
  },
  { once: true },
);
</script>

<template>
  <floating-panel-root
    v-model:open="showPanel"
    :default-size="defaultSize"
    :get-anchor-position="getAnchorPosition"
  >
    <floating-panel-trigger class="cdx-button">Lexis</floating-panel-trigger>
    <teleport to="body">
      <floating-panel-positioner class="positioner">
        <floating-panel-content class="content" data-id="lexis-root">
          <floating-panel-drag-trigger>
            <floating-panel-header class="header">
              <div class="title">{{ currentTabContent?.title }}</div>

              <floating-panel-control class="control">
                <cdx-button
                  :action="currentTab === '/search' ? 'progressive' : 'default'"
                  weight="quiet"
                  size="small"
                  title="Tra cứu"
                  aria-label="Tra cứu"
                  @click="nav.push('/search')"
                >
                  <cdx-icon :icon="cdxIconSearch" size="small" />
                </cdx-button>
                <cdx-button
                  :action="currentTab === '/history' ? 'progressive' : 'default'"
                  weight="quiet"
                  size="small"
                  title="Lịch sử"
                  aria-label="Lịch sử"
                  @click="nav.push('/history')"
                >
                  <cdx-icon :icon="cdxIconHistory" size="small" />
                </cdx-button>
                <cdx-button
                  :action="
                    ['/dictionary', '/reference', '/term'].some((prefix) =>
                      currentTab.startsWith(prefix),
                    )
                      ? 'progressive'
                      : 'default'
                  "
                  weight="quiet"
                  size="small"
                  title="Từ điển"
                  aria-label="Từ điển"
                  @click="nav.push('/dictionary/list')"
                >
                  <cdx-icon :icon="cdxIconReferences" size="small" />
                </cdx-button>
                <cdx-button
                  :action="currentTab === '/about' ? 'progressive' : 'default'"
                  weight="quiet"
                  size="small"
                  title="Giới thiệu"
                  aria-label="Giới thiệu"
                  @click="nav.push('/about')"
                >
                  <cdx-icon :icon="cdxIconInfo" size="small" />
                </cdx-button>
                <floating-panel-close-trigger as-child>
                  <cdx-button weight="quiet" size="small" title="Đóng">
                    <cdx-icon :icon="cdxIconClose" size="small" />
                  </cdx-button>
                </floating-panel-close-trigger>
              </floating-panel-control>
            </floating-panel-header>
          </floating-panel-drag-trigger>

          <floating-panel-body class="body">
            <component :is="currentTabContent?.component" />
          </floating-panel-body>

          <floating-panel-resize-trigger axis="n" class="resize-trigger" />
          <floating-panel-resize-trigger axis="e" class="resize-trigger" />
          <floating-panel-resize-trigger axis="w" class="resize-trigger" />
          <floating-panel-resize-trigger axis="s" class="resize-trigger" />
          <floating-panel-resize-trigger axis="ne" class="resize-trigger" />
          <floating-panel-resize-trigger axis="se" class="resize-trigger" />
          <floating-panel-resize-trigger axis="sw" class="resize-trigger" />
          <floating-panel-resize-trigger axis="nw" class="resize-trigger" />
        </floating-panel-content>
      </floating-panel-positioner>
    </teleport>
  </floating-panel-root>
</template>

<style scoped>
.positioner {
  z-index: 100;
}

.content {
  background-color: var(--background-color-base);
  border: 1px solid var(--border-color-subtle);
  width: 100%;
  display: flex;
  flex-direction: column;
  outline: none;

  &[data-topmost] {
    z-index: 999999;
  }

  &[hidden] {
    display: none;
  }
}

.header {
  padding-block: 0.25rem;
  padding-inline: 0.625rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--background-color-neutral);
  border-bottom: 1px solid var(--border-color-subtle);
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.title {
  display: flex;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-neutral);
}

.control {
  display: flex;
  align-items: center;
}

.body {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-size: 0.875rem;
  min-height: 0;
}

.resize-trigger {
  &[data-axis='n'],
  &[data-axis='s'] {
    height: 6px;
    max-width: 90%;
  }

  &[data-axis='e'],
  &[data-axis='w'] {
    width: 6px;
    max-height: 90%;
  }

  &[data-axis='ne'],
  &[data-axis='nw'],
  &[data-axis='se'],
  &[data-axis='sw'] {
    width: 10px;
    height: 10px;
  }
}
</style>
