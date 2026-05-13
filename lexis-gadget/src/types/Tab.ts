import SearchScreen from '@/components/SearchScreen.vue';
import HistoryScreen from '@/components/HistoryScreen.vue';
import DictionaryListScreen from '@/components/DictionaryListScreen.vue';
import DictionaryCreateScreen from '@/components/DictionaryCreateScreen.vue';
import AboutScreen from '@/components/AboutScreen.vue';
import DictionaryInfoScreen from '@/components/DictionaryInfoScreen.vue';
import type { Dictionary, DictionaryId, DictionaryType } from '@/types/Dictionary.ts';
import DictionaryUpdateScreen from '@/components/DictionaryUpdateScreen.vue';
import ReferenceCreateScreen from '@/components/ReferenceCreateScreen.vue';
import type { TabInDictInfo } from '@/types/TabInDictInfo.ts';
import ReferenceUpdateScreen from '@/components/ReferenceUpdateScreen.vue';
import type { ReferenceEntity } from '@/types/ReferenceEntity.ts';
import TermCreateScreen from '@/components/TermCreateScreen.vue';
import TermUpdateScreen from '@/components/TermUpdateScreen.vue';
import type { TermEntity } from '@/types/TermEntity.ts';
import ReferenceQuickImportScreen from '@/components/ReferenceQuickImportScreen.vue';

export const tabs = {
  '/search': { title: 'Tra cứu', component: SearchScreen },
  '/history': { title: 'Lịch sử', component: HistoryScreen },
  '/dictionary/list': { title: 'Từ điển', component: DictionaryListScreen },
  '/dictionary/info': { title: 'Từ điển', component: DictionaryInfoScreen },
  '/dictionary/create': { title: 'Từ điển', component: DictionaryCreateScreen },
  '/dictionary/update': { title: 'Từ điển', component: DictionaryUpdateScreen },
  '/reference/create': { title: 'Từ điển', component: ReferenceCreateScreen },
  '/reference/update': { title: 'Từ điển', component: ReferenceUpdateScreen },
  '/reference/import': { title: 'Từ điển', component: ReferenceQuickImportScreen },
  '/term/create': { title: 'Từ điển', component: TermCreateScreen },
  '/term/update': { title: 'Từ điển', component: TermUpdateScreen },
  '/about': { title: 'Giới thiệu', component: AboutScreen },
} as const;

export type TabPath = keyof typeof tabs;

export interface TabPayloadMap extends Record<TabPath, object> {
  '/dictionary/create': {
    dictionaryType: DictionaryType;
  };
  '/dictionary/info': {
    dictionaryId: DictionaryId;
    tab?: TabInDictInfo;
  };
  '/dictionary/update': {
    dictionary: Dictionary;
  };
  '/reference/create': {
    dictionaryId: DictionaryId;
  };
  '/reference/update': {
    referenceEntity: ReferenceEntity;
  };
  '/term/create': {
    dictionaryId: DictionaryId;
  };
  '/term/update': {
    termEntity: TermEntity;
  };
  '/reference/import': {
    dictionaryId: DictionaryId;
  };
}
