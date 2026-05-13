import { db } from '@/utils/db.ts';
import type { SearchMatch } from '@/types/SearchMatch.ts';
import { generateNgrams, tokenize } from '@/utils/searchUtils.ts';
import type { TermEntity } from '@/types/TermEntity.ts';

export interface SearchTextOptions {
  activeDictionaryIds: string[];
  maxGram?: number;
}

export class SearchService {
  async searchText(text: string, options: SearchTextOptions): Promise<SearchMatch[]> {
    const tokens = tokenize(text);

    if (tokens.length === 0) {
      return [];
    }

    const ngrams = generateNgrams(tokens, options.maxGram ?? 4);
    const candidateKeys = [...new Set(ngrams.map((x) => x.normalized))];
    const matchedTerms = await db.terms.where('searchKeys').anyOf(candidateKeys).toArray();
    const filteredTerms = matchedTerms.filter((term) =>
      options.activeDictionaryIds.includes(term.dictionaryId),
    );

    // inverted lookup:
    // searchKey -> terms[]
    const termMap = new Map<string, TermEntity[]>();

    for (const term of filteredTerms) {
      for (const key of term.searchKeys) {
        if (!termMap.has(key)) {
          termMap.set(key, []);
        }

        termMap.get(key)!.push(term);
      }
    }

    const matches: SearchMatch[] = [];

    for (const gram of ngrams) {
      const matched = termMap.get(gram.normalized);

      if (!matched) {
        continue;
      }

      for (const term of matched) {
        const matchedBy =
          term.normalizedTerm === gram.normalized
            ? 'term'
            : term.normalizedAliases.includes(gram.normalized)
              ? 'alias'
              : 'generated';

        matches.push({
          matchedText: gram.text,
          normalizedMatchedText: gram.normalized,
          start: gram.start,
          end: gram.end,
          matchedBy,
          score: this.calculateScore(gram.tokenLength, matchedBy),
          term,
        });
      }
    }

    return this.resolveOverlaps(this.dedupeMatches(matches));
  }

  private calculateScore(tokenLength: number, matchedBy: 'term' | 'alias' | 'generated') {
    let score = 0;

    score += tokenLength * 100;

    if (matchedBy === 'term') {
      score += 100;
    } else if (matchedBy === 'alias') {
      score += 50;
    }

    return score;
  }

  private dedupeMatches(matches: SearchMatch[]): SearchMatch[] {
    const map = new Map<string, SearchMatch>();

    for (const match of matches) {
      const key = [match.term.dictionaryId, match.term.term, match.start, match.end].join('::');

      const existing = map.get(key);

      if (!existing || existing.score < match.score) {
        map.set(key, match);
      }
    }

    return [...map.values()];
  }

  private resolveOverlaps(matches: SearchMatch[]): SearchMatch[] {
    const sorted = [...matches].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.start - b.start;
    });

    const accepted: SearchMatch[] = [];

    for (const candidate of sorted) {
      const overlapped = accepted.some((x) => this.isOverlap(x, candidate));

      if (!overlapped) {
        accepted.push(candidate);
      }
    }

    return accepted.sort((a, b) => a.start - b.start);
  }

  private isOverlap(a: SearchMatch, b: SearchMatch) {
    return a.start < b.end && b.start < a.end;
  }

  removeDuplicates(matches: SearchMatch[]) {
    return [...new Map(matches.map((m) => [m.term.term, m])).values()];
  }
}

export const searchService = new SearchService();
