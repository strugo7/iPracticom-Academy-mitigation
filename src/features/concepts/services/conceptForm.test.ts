import { describe, expect, it } from 'vitest'
import type { Concept } from '@/types/entities'
import { emptyDraft } from './conceptForm'
import {
  conceptPayload,
  draftFromConcept,
  firstInvalidStep,
  validateDraft,
} from './conceptForm'

describe('draftFromConcept', () => {
  const base: Concept = {
    id: '1',
    created_date: '2026-01-01T00:00:00Z',
    updated_date: '2026-01-01T00:00:00Z',
    term: 'VLAN',
    short_description: 'רשת וירטואלית',
    full_description: '<p>הסבר</p>',
    category: 'רשתות',
  }

  it('ממלא ברירות-מחדל של ה-SRS לשדות חסרים', () => {
    const draft = draftFromConcept(base)
    expect(draft.difficulty_level).toBe('intermediate')
    expect(draft.status).toBe('draft')
    expect(draft.examples).toEqual([])
    expect(draft.related_lessons).toEqual([])
  })

  it("סטטוס 'deleted' אינו ניתן לעריכה — חוזר לטיוטה", () => {
    expect(draftFromConcept({ ...base, status: 'deleted' }).status).toBe('draft')
    expect(draftFromConcept({ ...base, status: 'archived' }).status).toBe('archived')
  })
})

describe('conceptPayload', () => {
  it('מקצץ רווחים וזורק דוגמאות/קישורים ריקים', () => {
    const payload = conceptPayload({
      ...emptyDraft(),
      term: '  VLAN  ',
      short_description: ' תיאור ',
      full_description: '<p>הסבר</p>',
      examples: ['דוגמה', '   ', ''],
      external_links: [
        { title: ' IEEE ', url: ' https://x.dev ' },
        { title: '  ', url: '  ' },
      ],
    })
    expect(payload.term).toBe('VLAN')
    expect(payload.short_description).toBe('תיאור')
    expect(payload.examples).toEqual(['דוגמה'])
    expect(payload.external_links).toEqual([
      { title: 'IEEE', url: 'https://x.dev' },
    ])
  })
})

describe('validateDraft', () => {
  const valid = {
    ...emptyDraft(),
    term: 'VLAN',
    short_description: 'תיאור קצר',
    full_description: '<p>הסבר מלא</p>',
  }

  it('טיוטה תקינה — ללא שגיאות', () => {
    expect(validateDraft(valid)).toEqual([])
  })

  it('HTML בלי טקסט נחשב הסבר-מלא ריק', () => {
    expect(validateDraft({ ...valid, full_description: '<p></p>' })).toEqual([
      'full_description',
    ])
    expect(validateDraft({ ...valid, full_description: '<p>&nbsp;</p>' })).toEqual([
      'full_description',
    ])
  })

  it('תיאור קצר מעל 140 תווים נפסל', () => {
    expect(
      validateDraft({ ...valid, short_description: 'א'.repeat(141) }),
    ).toEqual(['short_description'])
  })

  it('firstInvalidStep מחזיר את השלב שבו השדה מוצג', () => {
    expect(firstInvalidStep(['term'])).toBe(1)
    expect(firstInvalidStep(['full_description'])).toBe(2)
    expect(firstInvalidStep([])).toBeNull()
  })
})
