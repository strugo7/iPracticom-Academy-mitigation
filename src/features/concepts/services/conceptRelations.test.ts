import { describe, expect, it } from 'vitest'
import type {
  Concept,
  LessonBlockEnvelope,
  ModuleLesson,
  Topic,
} from '@/types/entities'
import { resolveLinkedLessons, resolveRelatedConcepts } from './conceptRelations'

function concept(p: Partial<Concept> & { id: string; term: string }): Concept {
  return {
    created_date: '2026-01-01T00:00:00Z',
    updated_date: '2026-01-01T00:00:00Z',
    short_description: '',
    full_description: '',
    category: 'כללי',
    ...p,
  }
}

describe('resolveRelatedConcepts', () => {
  const vlan = concept({
    id: 'vlan',
    term: 'VLAN',
    related_terms: ['DHCP', 'רשת וירטואלית', 'מונח שלא קיים'],
  })
  const all = [
    vlan,
    concept({ id: 'dhcp', term: 'DHCP' }),
    concept({ id: 'net', term: 'רשת', synonyms: ['רשת וירטואלית'] }),
  ]

  it('ממפה תווית למונח קיים לפי term או synonym; לא-קיים נשאר בלי קישור', () => {
    const rels = resolveRelatedConcepts(vlan, all)
    expect(rels.map((r) => [r.label, r.concept?.id])).toEqual([
      ['DHCP', 'dhcp'],
      ['רשת וירטואלית', 'net'],
      ['מונח שלא קיים', undefined],
    ])
  })

  it('לא מקשר מונח לעצמו', () => {
    const self = concept({ id: 'x', term: 'X', related_terms: ['X'] })
    expect(resolveRelatedConcepts(self, [self]).map((r) => r.concept)).toEqual([
      null,
    ])
  })
})

describe('resolveLinkedLessons', () => {
  const CID = '69dc7d10bca7c3cb7172fc2a'
  const target = concept({ id: CID, term: 'מיקסר', related_lessons: ['l-linked'] })

  function textBlock(html: string): LessonBlockEnvelope {
    return { type: 'text', data: { content: html } } as unknown as LessonBlockEnvelope
  }
  function lesson(
    id: string,
    topicId: string | null,
    blocks: LessonBlockEnvelope[] | null,
  ): ModuleLesson {
    return {
      id,
      created_date: '2026-01-01T00:00:00Z',
      updated_date: '2026-01-01T00:00:00Z',
      title: `שיעור ${id}`,
      topic_id: topicId,
      blocks,
    }
  }
  const topics: Topic[] = [
    {
      id: 't1',
      created_date: '',
      updated_date: '',
      shared_module_id: 'm1',
      title: 'יסודות סאונד',
    },
  ]

  it('מאחד backlinks (סימון בטקסט) עם related_lessons, בלי כפילויות', () => {
    const lessons = [
      lesson('l-marked', 't1', [
        textBlock(`<span data-concept-id="${CID}">מיקסר</span>`),
      ]),
      lesson('l-linked', null, null), // רק ב-related_lessons
      lesson('l-both', 't1', [
        textBlock(`<span data-concept-id="${CID}">ממיקסרים</span>`),
      ]),
      lesson('l-none', 't1', [textBlock('<p>בלי סימון</p>')]),
    ]
    // l-both גם ב-related_lessons וגם מסומן — לא אמור להופיע פעמיים
    const t = { ...target, related_lessons: ['l-linked', 'l-both'] }
    const result = resolveLinkedLessons(t, lessons, topics)
    expect(result.map((l) => l.lessonId).sort()).toEqual([
      'l-both',
      'l-linked',
      'l-marked',
    ])
    expect(result.find((l) => l.lessonId === 'l-marked')?.meta).toBe(
      'נושא · יסודות סאונד',
    )
    expect(result.find((l) => l.lessonId === 'l-linked')?.meta).toBe(
      'שיעור באקדמיה',
    )
  })
})
