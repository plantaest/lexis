import { mwApi } from '@/utils/mwApi.ts';

export async function fetchPageContent(pageTitle: string): Promise<string | null> {
  const response = await mwApi.get({
    action: 'query',
    prop: 'revisions',
    rvprop: 'content',
    rvslots: 'main',
    titles: pageTitle,
    formatversion: '2',
  });

  const page = response.query.pages[0];

  return page?.revisions?.[0]?.slots?.main?.content ?? null;
}
