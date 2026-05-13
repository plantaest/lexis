import type { BaseIssue } from 'valibot';

export function formatIssues(issues: BaseIssue[]): string {
  return issues
    .map((issue) => {
      const path =
        issue.path
          ?.map((p) => String(p.key))
          .filter(Boolean)
          .join('.') ?? '(unknown)';

      return `${path}: ${issue.message}`;
    })
    .join('; ');
}
