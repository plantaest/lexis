import { normalizeVi } from '@/utils/normalizeVi.ts';

const TOKEN_REGEX = /[\p{L}\p{N}-]+/gu;

export interface Token {
  raw: string;
  normalized: string;
  start: number;
  end: number;
}

export function tokenize(text: string): Token[] {
  const matches = text.matchAll(TOKEN_REGEX);
  const tokens: Token[] = [];

  for (const match of matches) {
    const raw = match[0];

    if (!raw) {
      continue;
    }

    const start = match.index ?? 0;

    tokens.push({
      raw,
      normalized: normalizeVi(raw),
      start,
      end: start + raw.length,
    });
  }

  return tokens;
}

export interface NGram {
  text: string;
  normalized: string;
  start: number;
  end: number;
  tokenLength: number;
}

export function generateNgrams(tokens: Token[], maxGram = 4): NGram[] {
  const result: NGram[] = [];

  for (let i = 0; i < tokens.length; i++) {
    for (let len = 1; len <= maxGram; len++) {
      const slice = tokens.slice(i, i + len);

      if (slice.length !== len) {
        continue;
      }

      const first = slice[0];
      const last = slice[slice.length - 1];

      if (!first || !last) {
        continue;
      }

      result.push({
        text: slice.map((x) => x.raw).join(' '),
        normalized: slice.map((x) => x.normalized).join(' '),
        start: first.start,
        end: last.end,
        tokenLength: len,
      });
    }
  }

  return result;
}
