import { describe, expect, it } from 'vitest'
import type { Concept } from '@/types/entities'
import { EMPTY_FILTERS } from '../types'
import {
  categoryChips,
  filterConcepts,
  formatViews,
  isFiltering,
} from './conceptSearch'

function concept(overrides: Partial<Concept> & { id: string; term: string }): Concept {
  return {
    created_date: '2026-01-01T00:00:00Z',
    updated_date: '2026-01-01T00:00:00Z',
    short_description: '',
    full_description: '',
    category: 'כללי',
    ...overrides,
  }
}

const CONCEPTS: Concept[] = [
  concept({
    id: '1',
    term: 'VLAN',
    category: 'רשתות',
    difficulty_level: 'intermediate',
    status: 'published',
    view_count: 1284,
    short_description: 'רשת מקומית וירטואלית',
    related_terms: ['802.1Q'],
    synonyms: ['רשת וירטואלית'],
  }),
  concept({
    id: '2',
    term: 'PoE',
    category: 'חומרה',
    difficulty_level: 'beginner',
    status: 'published',
    view_count: 932,
    related_terms: ['802.3af'],
  }),
  concept({
    id: '3',
    term: 'NVR',
    // קטגוריית-ציוד — אינה מבין 8 הקטגוריות של ה-SRS
    category: 'מצלמות אבטחה',
    difficulty_level: 'advanced',
    status: 'draft',
    view_count: 40,
  }),
]

describe('filterConcepts', () => {
  it('ממיין א-ב כברירת מחדל', () => {
    const result = filterConcepts(CONCEPTS, EMPTY_FILTERS)
    expect(result.map((c) => c.term)).toEqual(['NVR', 'PoE', 'VLAN'])
  })

  it('ממיין לפי מונה-צפיות יורד', () => {
    const result = filterConcepts(CONCEPTS, { ...EMPTY_FILTERS, sort: 'views' })
    expect(result.map((c) => c.term)).toEqual(['VLAN', 'PoE', 'NVR'])
  })

  it('חיפוש חופשי תופס גם מילה נרדפת וגם תגית', () => {
    const bySynonym = filterConcepts(CONCEPTS, {
      ...EMPTY_FILTERS,
      search: 'וירטואלית',
    })
    expect(bySynonym.map((c) => c.id)).toEqual(['1'])

    const byTag = filterConcepts(CONCEPTS, { ...EMPTY_FILTERS, search: '802.3af' })
    expect(byTag.map((c) => c.id)).toEqual(['2'])
  })

  it('מסנן לפי קטגוריה, קושי וסטטוס במצטבר', () => {
    expect(
      filterConcepts(CONCEPTS, { ...EMPTY_FILTERS, status: 'draft' }).map((c) => c.id),
    ).toEqual(['3'])
    expect(
      filterConcepts(CONCEPTS, { ...EMPTY_FILTERS, difficulty: 'beginner' }).map(
        (c) => c.id,
      ),
    ).toEqual(['2'])
    expect(
      filterConcepts(CONCEPTS, {
        ...EMPTY_FILTERS,
        category: 'רשתות',
        difficulty: 'beginner',
      }),
    ).toEqual([])
  })

  it('סינון לפי תגית מדויק (לא חיפוש חלקי)', () => {
    expect(
      filterConcepts(CONCEPTS, { ...EMPTY_FILTERS, tag: '802.1Q' }).map((c) => c.id),
    ).toEqual(['1'])
    expect(filterConcepts(CONCEPTS, { ...EMPTY_FILTERS, tag: '802' })).toEqual([])
  })

  it('קטגוריית-ציוד שאינה ב-8 של ה-SRS ניתנת לסינון ואינה נעלמת', () => {
    const result = filterConcepts(CONCEPTS, {
      ...EMPTY_FILTERS,
      category: 'מצלמות אבטחה',
    })
    expect(result.map((c) => c.id)).toEqual(['3'])
  })
})

describe('categoryChips', () => {
  it('מונה לפי שאר הפילטרים ומחזיר גם קטגוריה שהתרוקנה', () => {
    const chips = categoryChips(CONCEPTS, { ...EMPTY_FILTERS, status: 'published' })
    const byCategory = Object.fromEntries(chips.map((c) => [c.category, c.count]))
    expect(byCategory).toEqual({ רשתות: 1, חומרה: 1, 'מצלמות אבטחה': 0 })
  })

  it('מונה הקטגוריה עצמה אינו מושפע מבחירת קטגוריה אחרת', () => {
    const chips = categoryChips(CONCEPTS, { ...EMPTY_FILTERS, category: 'רשתות' })
    expect(chips.find((c) => c.category === 'חומרה')?.count).toBe(1)
  })
})

describe('isFiltering / formatViews', () => {
  it('מיון אינו נחשב סינון', () => {
    expect(isFiltering({ ...EMPTY_FILTERS, sort: 'views' })).toBe(false)
    expect(isFiltering({ ...EMPTY_FILTERS, tag: 'x' })).toBe(true)
    expect(isFiltering({ ...EMPTY_FILTERS, search: '  ' })).toBe(false)
  })

  it('מקצר אלפים', () => {
    expect(formatViews(932)).toBe('932')
    expect(formatViews(1284)).toBe('1.3K')
    expect(formatViews(2000)).toBe('2K')
  })
})
