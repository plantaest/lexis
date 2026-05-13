import { normalizeVi } from '@/utils/normalizeVi.ts';
import pluralize from 'pluralize';

export function generateSearchKeys(term: string, aliases: string[], language?: string) {
  const keys = new Set<string>();

  const add = (value: string) => {
    if (!value) {
      return;
    }
    const normalized = normalizeVi(value.trim());
    if (!normalized) {
      return;
    }
    keys.add(normalized);
  };

  add(term);
  aliases.forEach(add);

  if (language === 'en') {
    add(pluralize.plural(term));
    add(pluralize.singular(term));

    for (const alias of aliases) {
      add(pluralize.plural(alias));
      add(pluralize.singular(alias));
    }
  }

  return [...keys];
}
