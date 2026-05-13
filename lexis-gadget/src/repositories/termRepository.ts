import { db } from '@/utils/db.ts';
import type { LdfDocument } from '@/types/LdfDocument.ts';
import type { Term } from '@/types/Term.ts';
import type { TermEntity } from '@/types/TermEntity.ts';
import { normalizeVi } from '@/utils/normalizeVi.ts';
import { Dexie } from 'dexie';
import { generateSearchKeys } from '@/utils/generateSearchKeys.ts';

export class TermRepository {
  async replaceDictionaryTerms(document: LdfDocument) {
    const dictionaryId = document.meta.id;

    if (!dictionaryId) {
      throw new Error('Dictionary ID is required');
    }

    await db.transaction('rw', db.terms, async () => {
      await db.terms.where('dictionaryId').equals(dictionaryId).delete();

      if (document.terms.length === 0) {
        return;
      }

      await db.terms.bulkAdd(
        document.terms.map((term, index) => this.toEntity(dictionaryId, term, index)),
      );
    });
  }

  async getTermsByDictionaryId(dictionaryId: string) {
    return db.terms.where('dictionaryId').equals(dictionaryId);
  }

  async getTerm(dictionaryId: string, term: string) {
    return db.terms.get([dictionaryId, term]);
  }

  async hasTerm(dictionaryId: string, term: string) {
    const entity = await this.getTerm(dictionaryId, term);
    return !!entity;
  }

  async searchTerms(dictionaryId: string, keyword: string, page: number, pageSize: number) {
    const normalized = normalizeVi(keyword);
    const baseQuery = db.terms
      .where('[dictionaryId+order]')
      .between([dictionaryId, Dexie.minKey], [dictionaryId, Dexie.maxKey]);
    const filtered = baseQuery.filter((term) => {
      if (term.normalizedTerm.includes(normalized)) {
        return true;
      }
      if (term.normalizedAliases.some((alias) => alias.includes(normalized))) {
        return true;
      }
      return term.translations.some((translation) =>
        normalizeVi(translation.target).includes(normalized),
      );
    });
    const total = await filtered.count();
    const items = await filtered
      .reverse()
      .offset(page * pageSize)
      .limit(pageSize)
      .toArray();

    return {
      items,
      total,
    };
  }

  async countTerms(dictionaryId: string) {
    return db.terms.where('dictionaryId').equals(dictionaryId).count();
  }

  async getPagedTerms(dictionaryId: string, page: number, pageSize: number) {
    return db.terms
      .where('[dictionaryId+order]')
      .between([dictionaryId, Dexie.minKey], [dictionaryId, Dexie.maxKey])
      .reverse()
      .offset(page * pageSize)
      .limit(pageSize)
      .toArray();
  }

  async putTerm(term: TermEntity, oldTerm?: string) {
    const newKey: [string, string] = [term.dictionaryId, term.term];

    // CREATE
    if (!oldTerm) {
      const existed = await db.terms.get(newKey);

      if (existed) {
        throw new Error('Term already exists');
      }

      const last = await db.terms
        .where('[dictionaryId+order]')
        .between([term.dictionaryId, Dexie.minKey], [term.dictionaryId, Dexie.maxKey])
        .last();

      const nextOrder = last && last.order ? last.order + 1 : 0;

      return db.terms.put({ ...term, order: nextOrder });
    }

    // UPDATE
    const oldKey: [string, string] = [term.dictionaryId, oldTerm];
    const existing = await db.terms.get(oldKey);

    if (!existing) {
      throw new Error('Original term not found');
    }

    await db.transaction('rw', db.terms, async () => {
      if (oldTerm !== term.term) {
        await db.terms.delete(oldKey);
      }

      await db.terms.put({ ...term, order: existing.order });
    });
  }

  async deleteTerm(dictionaryId: string, term: string) {
    return db.terms.delete([dictionaryId, term]);
  }

  async findTermsUsingReference(dictionaryId: string, refId: string) {
    const terms = await db.terms.where('dictionaryId').equals(dictionaryId).toArray();

    return terms.filter((term) =>
      term.translations.some((translation) =>
        translation.references.some(
          (reference) => reference.type === 'ref' && reference.id === refId,
        ),
      ),
    );
  }

  toEntity(dictionaryId: string, term: Term, order?: number): TermEntity {
    return {
      order,
      dictionaryId,
      term: term.term,
      normalizedTerm: normalizeVi(term.term),
      aliases: term.aliases,
      normalizedAliases: term.aliases.map((alias) => normalizeVi(alias)),
      searchKeys: generateSearchKeys(term.term, term.aliases, 'en'), // !!! TEMPORARY !!!
      translations: term.translations.map((translation) => ({
        target: translation.target,
        note: translation.note,
        references: translation.references,
      })),
    };
  }
}

export const termRepository = new TermRepository();
