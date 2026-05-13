import { mwForeignApi } from '@/utils/mwForeignApi.ts';

export async function fetchUserOption(optionKey: string): Promise<string | null> {
  const params = {
    formatversion: 2,
    action: 'query',
    meta: 'userinfo',
    uiprop: 'options',
  };

  const response = await mwForeignApi.get(params);

  return response.query.userinfo.options[optionKey] ?? null;
}
