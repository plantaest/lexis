import { db } from '@/utils/db.ts';
import type { Reference } from '@/types/Reference.ts';
import type { LdfDocument } from '@/types/LdfDocument.ts';
import type { ReferenceEntity } from '@/types/ReferenceEntity.ts';
import { normalizeVi } from '@/utils/normalizeVi.ts';
import { Dexie } from 'dexie';

export class ReferenceRepository {
  async replaceDictionaryReferences(document: LdfDocument) {
    const dictionaryId = document.meta.id;

    if (!dictionaryId) {
      throw new Error('Dictionary ID is required');
    }

    await db.transaction('rw', db.refs, async () => {
      await db.refs.where('dictionaryId').equals(dictionaryId).delete();

      if (document.refs.length === 0) {
        return;
      }

      await db.refs.bulkAdd(
        document.refs.map((ref, index) => this.toEntity(dictionaryId, ref, index)),
      );
    });
  }

  async getReferencesByDictionaryId(dictionaryId: string) {
    return db.refs.where('dictionaryId').equals(dictionaryId);
  }

  async getReference(dictionaryId: string, refId: string) {
    return db.refs.get([dictionaryId, refId]);
  }

  async hasReference(dictionaryId: string, refId: string) {
    const ref = await this.getReference(dictionaryId, refId);
    return !!ref;
  }

  async searchReferences(dictionaryId: string, keyword: string, page: number, pageSize: number) {
    const normalized = normalizeVi(keyword);
    const baseQuery = db.refs
      .where('[dictionaryId+order]')
      .between([dictionaryId, Dexie.minKey], [dictionaryId, Dexie.maxKey]);
    const filtered = baseQuery.filter((ref) => {
      return (
        normalizeVi(ref.refId).includes(normalized) || normalizeVi(ref.content).includes(normalized)
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

  async countReferences(dictionaryId: string) {
    return db.refs.where('dictionaryId').equals(dictionaryId).count();
  }

  async getPagedReferences(dictionaryId: string, page: number, pageSize: number) {
    return db.refs
      .where('[dictionaryId+order]')
      .between([dictionaryId, Dexie.minKey], [dictionaryId, Dexie.maxKey])
      .reverse()
      .offset(page * pageSize)
      .limit(pageSize)
      .toArray();
  }

  async putReference(reference: ReferenceEntity) {
    const existing = await db.refs.get([reference.dictionaryId, reference.refId]);

    if (existing) {
      return db.refs.put({
        ...reference,
        order: existing.order,
      });
    }

    const last = await db.refs
      .where('[dictionaryId+order]')
      .between([reference.dictionaryId, Dexie.minKey], [reference.dictionaryId, Dexie.maxKey])
      .last();

    const nextOrder = last && last.order ? last.order + 1 : 0;

    return db.refs.put({
      ...reference,
      order: nextOrder,
    });
  }

  async deleteReference(dictionaryId: string, refId: string) {
    return db.refs.delete([dictionaryId, refId]);
  }

  toEntity(dictionaryId: string, reference: Reference, order?: number): ReferenceEntity {
    return {
      order,
      dictionaryId,
      refId: reference.id,
      content: reference.content,
      url: reference.url,
    };
  }
}

export const referenceRepository = new ReferenceRepository();
