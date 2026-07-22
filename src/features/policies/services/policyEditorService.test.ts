import { describe, expect, it } from 'vitest'
import type { Procedure, User } from '@/types/entities'
import {
  computeReach,
  createEmptyDraft,
  draftToCreateInput,
  makeBlock,
  procedureToDraft,
  reindexBlocks,
  validateDraft,
} from './policyEditorService'

function makeUser(id: string, department: string): User {
  return {
    id,
    created_date: '2026-01-01T00:00:00.000Z',
    updated_date: '2026-01-01T00:00:00.000Z',
    email: `${id}@ipracticom.test`,
    full_name: id,
    role: 'user',
    department,
  }
}

describe('createEmptyDraft', () => {
  it('טיוטה חדשה עם כותרת+טקסט, סטטוס טיוטה, קרא-וחתום פעיל', () => {
    const draft = createEmptyDraft()
    expect(draft.status).toBe('draft')
    expect(draft.requiresAcknowledgement).toBe(true)
    expect(draft.blocks.map((b) => b.type)).toEqual(['heading', 'text'])
  })
})

describe('makeBlock / reindexBlocks', () => {
  it('makeBlock מזריע data לפי הסוג', () => {
    expect(makeBlock('table', 0).data).toEqual({
      headers: ['עמודה', 'עמודה'],
      rows: [{ cells: ['', ''] }],
    })
    expect(makeBlock('separator', 1).data).toEqual({})
  })

  it('reindexBlocks מקבע order_index רציף', () => {
    const blocks = [makeBlock('text', 5), makeBlock('heading', 9)]
    expect(reindexBlocks(blocks).map((b) => b.order_index)).toEqual([0, 1])
  })
})

describe('procedureToDraft', () => {
  it('ממפה שדות ומסדר בלוקים', () => {
    const procedure: Procedure = {
      id: 'p1',
      created_date: '2026-03-01T00:00:00.000Z',
      updated_date: '2026-03-01T00:00:00.000Z',
      title: 'נוהל',
      content_type: 'html',
      status: 'published',
      version: '2.0',
      category: 'תפעול',
      departments: ['טכנאי שטח'],
      blocks: [
        { id: 'b2', type: 'text', order_index: 1, data: {} },
        { id: 'b1', type: 'heading', order_index: 0, data: {} },
      ],
    }
    const draft = procedureToDraft(procedure)
    expect(draft.category).toBe('תפעול')
    expect(draft.blocks.map((b) => b.id)).toEqual(['b2', 'b1']) // סדר נשמר, order_index מקובע
    expect(draft.blocks.map((b) => b.order_index)).toEqual([0, 1])
  })
})

describe('draftToCreateInput — פרסום קובע סטטוס ותאריך', () => {
  it('publish=true → status=published + published_date', () => {
    const draft = createEmptyDraft()
    draft.title = 'נוהל חדש'
    const input = draftToCreateInput(draft, true)
    expect(input.status).toBe('published')
    expect(input.published_date).toBeTruthy()
    expect(input.title).toBe('נוהל חדש')
  })

  it('publish=false → נשאר טיוטה, ללא published_date', () => {
    const draft = createEmptyDraft()
    draft.title = 'טיוטה'
    const input = draftToCreateInput(draft, false)
    expect(input.status).toBe('draft')
    expect(input.published_date).toBeNull()
  })

  it('content_type=file → blocks=null, file_url נשמר', () => {
    const draft = createEmptyDraft()
    draft.title = 'קובץ'
    draft.contentType = 'file'
    draft.fileUrl = 'https://x/y.pdf'
    const input = draftToCreateInput(draft, false)
    expect(input.blocks).toBeNull()
    expect(input.file_url).toBe('https://x/y.pdf')
  })
})

describe('computeReach', () => {
  const users = [
    makeUser('u1', 'טכנאי שטח'),
    makeUser('u2', 'טכנאי שטח'),
    makeUser('u3', 'מכירות'),
  ]

  it('סוכם קהל-יעד מהמחלקות שנבחרו', () => {
    const draft = createEmptyDraft()
    draft.departments = ['טכנאי שטח']
    expect(computeReach(draft, users)).toBe(2)
  })

  it('ללא מחלקות/עובדים → 0 נמענים', () => {
    expect(computeReach(createEmptyDraft(), users)).toBe(0)
  })
})

describe('validateDraft', () => {
  it('דורש כותרת', () => {
    expect(validateDraft(createEmptyDraft())).toContain(
      'חובה להזין כותרת לנוהל.',
    )
  })

  it('מצב קובץ ללא קובץ — שגיאה', () => {
    const draft = createEmptyDraft()
    draft.title = 'x'
    draft.contentType = 'file'
    expect(validateDraft(draft)).toContain('במצב "קובץ" יש להעלות מסמך.')
  })

  it('טיוטה תקינה — ללא שגיאות', () => {
    const draft = createEmptyDraft()
    draft.title = 'נוהל תקין'
    expect(validateDraft(draft)).toHaveLength(0)
  })
})
