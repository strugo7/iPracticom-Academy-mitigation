import { describe, expect, it } from 'vitest'
import type { IApiClient, IResource } from '@/lib/api/types'
import type { BaseEntity } from '@/types/entities'
import { listDeleted, purgeItem, restoreItem } from './recycleBinService'

/** משאב בזיכרון (ללא fixtures) — מהיר ודטרמיניסטי לבדיקת השירות. */
function memResource<T extends BaseEntity>(initial: T[]): IResource<T> {
  let rows = [...initial]
  return {
    findMany: async () => rows.map((r) => ({ ...r })),
    findById: async (id) => rows.find((r) => r.id === id) ?? null,
    update: async (id, patch) => {
      rows = rows.map((r) => (r.id === id ? { ...r, ...patch } : r))
      return rows.find((r) => r.id === id) as T
    },
    delete: async (id) => {
      rows = rows.filter((r) => r.id !== id)
    },
    create: async () => {
      throw new Error('not implemented')
    },
    count: async () => rows.length,
  }
}

const base = { created_date: '2026-01-01', updated_date: '2026-01-01' }
const del = (at: string, who: string, why: string) => ({
  deleted_at: at,
  deleted_by_name: who,
  deletion_reason: why,
})

function makeClient() {
  return {
    procedures: memResource([
      {
        id: 'p1',
        ...base,
        title: 'נוהל מחוק',
        content_type: 'html',
        ...del('2026-05-02T10:00:00Z', 'מנהל א', 'מיושן'),
      },
      {
        id: 'p2',
        ...base,
        title: 'נוהל חי',
        content_type: 'html',
        status: 'published',
      },
    ] as never),
    moduleLessons: memResource([
      {
        id: 'l1',
        ...base,
        title: 'שיעור מחוק',
        ...del('2026-05-03T10:00:00Z', 'מנהל ב', 'שוכפל'),
      },
    ] as never),
    concepts: memResource([
      {
        id: 'c1',
        ...base,
        term: 'מונח מחוק',
        ...del('2026-05-01T10:00:00Z', 'מנהל ג', 'לא רלוונטי'),
      },
    ] as never),
    troubleshootingFlows: memResource([
      {
        id: 'f1',
        ...base,
        title: 'תסריט מחוק',
        ...del('2026-05-04T10:00:00Z', 'מנהל ד', 'הוחלף'),
      },
      { id: 'f2', ...base, title: 'תסריט חי' },
    ] as never),
  } as unknown as IApiClient
}

describe('listDeleted', () => {
  it('מאגד רק פריטים מחוקים מכל ארבע הישויות, ממוין מהחדש לישן', async () => {
    const items = await listDeleted(makeClient())
    expect(items).toHaveLength(4) // p1, l1, c1, f1 (לא p2/f2 החיים)
    // מיון יורד לפי deletedAt: f1(05-04) > l1(05-03) > p1(05-02) > c1(05-01)
    expect(items.map((i) => i.entityType)).toEqual([
      'flow',
      'lesson',
      'procedure',
      'concept',
    ])
  })

  it('כל פריט נושא תווית-סוג, כותרת, מי-מחק וסיבה', async () => {
    const items = await listDeleted(makeClient())
    const proc = items.find((i) => i.entityType === 'procedure')
    expect(proc?.typeLabel).toBe('נוהל')
    expect(proc?.title).toBe('נוהל מחוק')
    expect(proc?.deletedByName).toBe('מנהל א')
    expect(proc?.reason).toBe('מיושן')
    const concept = items.find((i) => i.entityType === 'concept')
    expect(concept?.title).toBe('מונח מחוק') // מ-term
  })
})

describe('restoreItem', () => {
  it('נוהל משוחזר ל-status=draft וסימני-המחיקה מתנקים', async () => {
    const client = makeClient()
    const items = await listDeleted(client)
    const proc = items.find((i) => i.entityType === 'procedure')!
    await restoreItem(client, proc)
    const restored = await client.procedures.findById('p1')
    expect(restored?.status).toBe('draft')
    expect(restored?.deleted_at).toBeNull()
    expect((await listDeleted(client)).some((i) => i.id === 'p1')).toBe(false)
  })

  it('תסריט (ללא status) משוחזר בניקוי-בלבד', async () => {
    const client = makeClient()
    const items = await listDeleted(client)
    const flow = items.find((i) => i.entityType === 'flow')!
    await restoreItem(client, flow)
    const restored = await client.troubleshootingFlows.findById('f1')
    expect(restored?.deleted_at).toBeNull()
  })
})

describe('purgeItem', () => {
  it('מוחק לצמיתות — הרשומה נעלמת מ-findById', async () => {
    const client = makeClient()
    const items = await listDeleted(client)
    const lesson = items.find((i) => i.entityType === 'lesson')!
    await purgeItem(client, lesson)
    expect(await client.moduleLessons.findById('l1')).toBeNull()
  })
})
