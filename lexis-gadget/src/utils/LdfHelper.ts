import type { LdfDocument } from '@/types/LdfDocument.ts';
import type { Reference } from '@/types/Reference.ts';
import type { Term, TermReferenceEntry, TermTranslation } from '@/types/Term.ts';
import { truncateString } from '@/utils/truncateString.ts';

// ======================================================
// LEXER
// ======================================================

class LdfLexer {
  static splitTopLevel(input: string, separator: string): string[] {
    const result: string[] = [];
    let current = '';
    let scalarDepth = 0;
    let arrayDepth = 0;
    let escaping = false;

    for (const char of input) {
      if (escaping) {
        current += char;
        escaping = false;
        continue;
      }

      if (char === '\\') {
        current += char;
        escaping = true;
        continue;
      }

      if (char === '<') scalarDepth++;
      if (char === '>') scalarDepth--;
      if (char === '[') arrayDepth++;
      if (char === ']') arrayDepth--;

      const isTopLevel = scalarDepth === 0 && arrayDepth === 0;

      if (char === separator && isTopLevel) {
        result.push(current);
        current = '';
        continue;
      }

      current += char;
    }

    result.push(current);
    return result;
  }
}

// ======================================================
// SCALAR
// ======================================================

class LdfScalar {
  static encode(value: string): string {
    return `<${LdfScalar.escape(value)}>`;
  }

  static decode(input: string): string {
    if (!input.startsWith('<') || !input.endsWith('>')) {
      throw new Error(`Invalid scalar: ${truncateString(input)}`);
    }

    return LdfScalar.unescape(input.slice(1, -1));
  }

  static escape(value: string): string {
    // prettier-ignore
    return value
      .replaceAll('\\', '\\\\')
      .replaceAll('<', '\\<')
      .replaceAll('>', '\\>');
  }

  static unescape(value: string): string {
    let result = '';
    let escaping = false;

    for (const char of value) {
      if (escaping) {
        result += char;
        escaping = false;
        continue;
      }

      if (char === '\\') {
        escaping = true;
        continue;
      }

      result += char;
    }

    return result;
  }
}

// ======================================================
// ARRAY
// ======================================================

class LdfArray {
  static encode(items: string[]): string {
    return `[${items.join(';')}]`;
  }

  static decode(input: string): string[] {
    if (!input.startsWith('[') || !input.endsWith(']')) {
      throw new Error(`Invalid array: ${input}`);
    }

    const content = input.slice(1, -1);

    if (!content) {
      return [];
    }

    return LdfLexer.splitTopLevel(content, ';');
  }
}

// ======================================================
// PARSER
// ======================================================

function parseReference(input: string): Reference {
  const parts = LdfLexer.splitTopLevel(input, ':');

  return {
    id: LdfScalar.decode(parts[0]!),
    content: LdfScalar.decode(parts[1]!),
    url: LdfScalar.decode(parts[2]!) || undefined,
  };
}

function parseTerm(input: string): Term {
  const parts = LdfLexer.splitTopLevel(input, ':');
  const aliases = LdfArray.decode(parts[1]!).map((value) => LdfScalar.decode(value));
  const translations = LdfArray.decode(parts[2]!).map((value) => parseTranslation(value));

  return {
    term: LdfScalar.decode(parts[0]!),
    aliases,
    translations,
  };
}

function parseTranslation(input: string): TermTranslation {
  const parts = LdfLexer.splitTopLevel(input, ':');

  return {
    target: LdfScalar.decode(parts[0]!),
    note: LdfScalar.decode(parts[1]!) || undefined,
    references: LdfArray.decode(parts[2]!).map((value) => parseTermReference(value)),
  };
}

function parseTermReference(input: string): TermReferenceEntry {
  const parts = LdfLexer.splitTopLevel(input, ':');
  const type = LdfScalar.decode(parts[0]!);

  if (type === 'ref') {
    return {
      type: 'ref',
      id: LdfScalar.decode(parts[1]!),
    };
  }

  return {
    type: 'inline',
    content: LdfScalar.decode(parts[1]!),
    url: LdfScalar.decode(parts[2]!) || undefined,
  };
}

// ======================================================
// SERIALIZER
// ======================================================

function serializeReference(ref: Reference): string {
  return [
    LdfScalar.encode(ref.id),
    LdfScalar.encode(ref.content),
    LdfScalar.encode(ref.url ?? ''),
  ].join(':');
}

function serializeTerm(term: Term): string {
  const aliases = LdfArray.encode(term.aliases.map((alias) => LdfScalar.encode(alias)));
  const translations = LdfArray.encode(
    term.translations.map((translation) => serializeTranslation(translation)),
  );

  return [LdfScalar.encode(term.term), aliases, translations].join(':');
}

function serializeTranslation(translation: TermTranslation): string {
  const refs = LdfArray.encode(
    (translation.references ?? []).map((ref) => serializeTermReference(ref)),
  );

  return [
    LdfScalar.encode(translation.target),
    LdfScalar.encode(translation.note ?? ''),
    refs,
  ].join(':');
}

function serializeTermReference(ref: TermReferenceEntry): string {
  if (ref.type === 'ref') {
    return [LdfScalar.encode('ref'), LdfScalar.encode(ref.id)].join(':');
  }

  return [
    LdfScalar.encode('inline'),
    LdfScalar.encode(ref.content),
    LdfScalar.encode(ref.url ?? ''),
  ].join(':');
}

// ======================================================
// MAIN HELPER
// ======================================================

export class LdfHelper {
  static parse(ldf: string): LdfDocument {
    const lines = ldf
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const document: LdfDocument = {
      meta: {},
      refs: [],
      refIds: new Set(),
      terms: [],
      termLemmas: new Set(),
    };

    let section = '';

    for (const line of lines) {
      if (line.startsWith('@')) {
        const [key, value] = line.substring(1).split(/\s+/);
        if (key) {
          document.meta[key] = value;
        }
        continue;
      }

      if (line.startsWith('#')) {
        section = line.slice(1);
        continue;
      }

      if (section === 'refs') {
        const ref = parseReference(line);
        document.refs.push(ref);
        document.refIds.add(ref.id);
        continue;
      }

      if (section === 'terms') {
        const term = parseTerm(line);
        document.terms.push(term);
        document.termLemmas.add(term.term);
      }
    }

    return document;
  }

  static serialize(document: LdfDocument): string {
    const lines: string[] = [];

    for (const [key, value] of Object.entries(document.meta)) {
      lines.push(`@${key} ${value}`);
    }

    lines.push('');
    lines.push('#refs');

    for (const ref of document.refs) {
      lines.push(serializeReference(ref));
    }

    lines.push('');
    lines.push('#terms');

    for (const term of document.terms) {
      lines.push(serializeTerm(term));
    }

    return lines.join('\n');
  }

  static addReference(document: LdfDocument, reference: Reference) {
    if (document.refIds.has(reference.id)) {
      throw new Error('Duplicate reference ID');
    }

    document.refs.push(reference);
    document.refIds.add(reference.id);
  }

  static addTerm(document: LdfDocument, term: Term) {
    if (document.termLemmas.has(term.term)) {
      throw new Error('Duplicate term lemma');
    }

    document.terms.push(term);
    document.termLemmas.add(term.term);
  }

  static parseReference(input: string) {
    return parseReference(input);
  }
}
