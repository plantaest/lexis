import type { User } from '@/types/User.ts';

export function upsertContributor(contributors: User[], contributor: User) {
  const exists = contributors.some((item) => item.id === contributor.id);

  if (!exists) {
    return [...contributors, contributor];
  }

  return contributors.map((item) => (item.id === contributor.id ? contributor : item));
}
