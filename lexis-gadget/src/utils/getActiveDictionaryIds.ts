import type { UserConfig } from '@/types/UserConfig.ts';

export function getActiveDictionaryIds(config: UserConfig) {
  return [
    ...config.privateDictionaryIds.filter((id) => config.privateDictionaryEnabled[id]),
    ...config.publicDictionaryIds.filter((id) => config.publicDictionaryEnabled[id]),
  ];
}
