import { describe, expect, it } from 'vitest'
import type { TroubleshootingFlow } from '@/types/entities'
import { EMPTY_FILTERS, type PlaybookFilters } from '../types'
import {
  categoryOptions,
  difficultyOptions,
  filterPlaybooks,
  isFiltering,
  tagOptions,
} from './playbookSearch'

function pb(
  id: string,
  over: Partial<TroubleshootingFlow>,
): TroubleshootingFlow {
  return {
    id,
    created_date: '2026-01-01T00:00:00.000Z',
    updated_date: '2026-01-01T00:00:00.000Z',
    title: `Playbook ${id}`,
    ...over,
  }
}

const filters = (over: Partial<PlaybookFilters>): PlaybookFilters => ({
  ...EMPTY_FILTERS,
  ...over,
})

const flows: TroubleshootingFlow[] = [
  pb('a', {
    title: 'אין צליל חיוג במרכזיית PBX',
    description: 'בדיקת רישום SIP',
    category: 'מרכזיות ענן (PBX)',
    difficulty_level: 'בינוני',
    tags: ['SIP', 'שלוחות'],
    usage_count: 47,
    success_rate: 92,
    created_date: '2026-03-01T00:00:00.000Z',
  }),
  pb('b', {
    title: 'מצלמת אבטחה לא מתחברת',
    category: 'מצלמות אבטחה',
    difficulty_level: 'קל',
    tags: ['PoE', 'NVR'],
    usage_count: 134,
    success_rate: 88,
    created_date: '2026-05-01T00:00:00.000Z',
  }),
  pb('c', {
    title: 'חסימת תעבורה ב-MikroTik',
    category: 'Firewall MikroTik',
    difficulty_level: 'מתקדם',
    tags: ['Firewall'],
    usage_count: 23,
    success_rate: 76,
    created_date: '2026-02-01T00:00:00.000Z',
  }),
]

describe('filterPlaybooks', () => {
  it('מסנן לפי קטגוריה', () => {
    const out = filterPlaybooks(flows, filters({ category: 'מצלמות אבטחה' }))
    expect(out.map((f) => f.id)).toEqual(['b'])
  })

  it('מסנן לפי רמת קושי', () => {
    const out = filterPlaybooks(flows, filters({ difficulty: 'מתקדם' }))
    expect(out.map((f) => f.id)).toEqual(['c'])
  })

  it('מסנן לפי תגית (case-insensitive)', () => {
    const out = filterPlaybooks(flows, filters({ tag: 'poe' }))
    expect(out.map((f) => f.id)).toEqual(['b'])
  })

  it('חיפוש חופשי על כותרת/תיאור/תגיות', () => {
    expect(
      filterPlaybooks(flows, filters({ search: 'SIP' })).map((f) => f.id),
    ).toEqual(['a'])
    expect(
      filterPlaybooks(flows, filters({ search: 'מצלמת' })).map((f) => f.id),
    ).toEqual(['b'])
  })

  it('ממיין לפי מספר שימושים', () => {
    const out = filterPlaybooks(flows, filters({ sort: 'usage' }))
    expect(out.map((f) => f.id)).toEqual(['b', 'a', 'c'])
  })

  it('ממיין לפי שיעור הצלחה', () => {
    const out = filterPlaybooks(flows, filters({ sort: 'success' }))
    expect(out.map((f) => f.id)).toEqual(['a', 'b', 'c'])
  })

  it('ברירת מחדל: החדשים תחילה (created_date יורד)', () => {
    const out = filterPlaybooks(flows, filters({}))
    expect(out.map((f) => f.id)).toEqual(['b', 'a', 'c'])
  })
})

describe('אפשרויות הבוררים', () => {
  it('קטגוריות ייחודיות ממוינות', () => {
    // מיון עברי (localeCompare 'he') — אותיות לטיניות אחרי אותיות עבריות.
    expect(categoryOptions(flows).map((o) => o.value)).toEqual([
      'מצלמות אבטחה',
      'מרכזיות ענן (PBX)',
      'Firewall MikroTik',
    ])
  })

  it('רמות קושי ייחודיות', () => {
    expect(
      difficultyOptions(flows)
        .map((o) => o.value)
        .sort(),
    ).toEqual(['בינוני', 'מתקדם', 'קל'].sort())
  })

  it('תגיות ייחודיות משוטחות', () => {
    expect(tagOptions(flows).map((o) => o.value)).toContain('SIP')
    expect(tagOptions(flows).map((o) => o.value)).toContain('NVR')
  })
})

describe('isFiltering', () => {
  it('false כשאין פילטר (מיון אינו פילטר)', () => {
    expect(isFiltering(filters({ sort: 'usage' }))).toBe(false)
  })
  it('true כשיש חיפוש או בורר פעיל', () => {
    expect(isFiltering(filters({ search: 'x' }))).toBe(true)
    expect(isFiltering(filters({ category: 'מצלמות אבטחה' }))).toBe(true)
  })
})
