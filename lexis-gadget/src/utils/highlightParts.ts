import { normalizeVi } from '@/utils/normalizeVi.ts';

export type HighlightPart = {
  text: string;
  match: boolean;
};

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build mapping from normalized index → raw index
 * (critical for correct highlighting Vietnamese text)
 */
function buildIndexMap(text: string) {
  const raw = Array.from(text);
  const normalized: string[] = [];
  const map: number[] = [];

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i]!;

    // normalize each char (remove diacritics step-by-step)
    const n = char.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (n.length === 0) continue;

    for (const c of n) {
      normalized.push(c.toLowerCase());
      map.push(i);
    }
  }

  return {
    normalizedText: normalized.join(''),
    indexMap: map,
  };
}

/**
 * Main function
 */
export function highlightParts(text: string, keyword: string): HighlightPart[] {
  if (!text) return [];
  if (!keyword?.trim()) return [{ text, match: false }];

  const keys = keyword.split(/\s+/).map(normalizeVi).filter(Boolean);

  const { normalizedText, indexMap } = buildIndexMap(text);

  if (!keys.length) return [{ text, match: false }];

  // build regex: key1|key2|key3
  const pattern = keys.map(escapeRegExp).join('|');
  const regex = new RegExp(pattern, 'gi');

  const matches: Array<{ start: number; end: number }> = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(normalizedText)) !== null) {
    const startNorm = match.index;
    const endNorm = match.index + match[0].length;

    const startRaw = indexMap[startNorm];
    const endRaw = indexMap[endNorm - 1]! + 1;

    if (startRaw !== undefined && endRaw !== undefined) {
      matches.push({ start: startRaw, end: endRaw });
    }
  }

  if (!matches.length) {
    return [{ text, match: false }];
  }

  // merge overlaps
  const merged: typeof matches = [];
  for (const m of matches.sort((a, b) => a.start - b.start)) {
    const last = merged[merged.length - 1];
    if (!last || m.start > last.end) {
      merged.push(m);
    } else {
      last.end = Math.max(last.end, m.end);
    }
  }

  // build parts
  const parts: HighlightPart[] = [];
  let cursor = 0;

  for (const m of merged) {
    if (cursor < m.start) {
      parts.push({
        text: text.slice(cursor, m.start),
        match: false,
      });
    }

    parts.push({
      text: text.slice(m.start, m.end),
      match: true,
    });

    cursor = m.end;
  }

  if (cursor < text.length) {
    parts.push({
      text: text.slice(cursor),
      match: false,
    });
  }

  return parts;
}
