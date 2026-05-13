import { mwForeignApi } from '@/utils/mwForeignApi.ts';

export async function saveUserOption(optionKey: string, optionValue: string | null) {
  await mwForeignApi.saveOption(optionKey, optionValue);
}
