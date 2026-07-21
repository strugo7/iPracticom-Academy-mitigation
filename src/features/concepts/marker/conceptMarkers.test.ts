import { describe, expect, it } from 'vitest'
import type { LessonBlockEnvelope, ModuleLesson } from '@/types/entities'
import {
  buildConceptBacklinks,
  conceptIdsInLesson,
  extractConceptIds,
} from './conceptMarkers'

const A = '69dc7d10bca7c3cb7172fc2a'
const B = '6a12c6f74efd4691f654f57b'

function lesson(id: string, blocks: LessonBlockEnvelope[] | null): ModuleLesson {
  return {
    id,
    created_date: '2026-01-01T00:00:00Z',
    updated_date: '2026-01-01T00:00:00Z',
    title: `שיעור ${id}`,
    blocks,
  }
}

function textBlock(html: string): LessonBlockEnvelope {
  return { type: 'text', data: { content: html } } as unknown as LessonBlockEnvelope
}

describe('extractConceptIds', () => {
  it('תופס מזהים ייחודיים, גם עם escaping של JSON', () => {
    const html = `<span data-concept-id="${A}" class="concept-term">מיקסר</span> ו-<span data-concept-id=\\"${B}\\">רכזת</span> ושוב <span data-concept-id="${A}">ממיקסרים</span>`
    expect(extractConceptIds(html).sort()).toEqual([A, B].sort())
  })

  it('מחזיר ריק כשאין סימונים', () => {
    expect(extractConceptIds('<p>טקסט רגיל בלי מונחים</p>')).toEqual([])
  })
})

describe('conceptIdsInLesson', () => {
  it('סורק את כל הבלוקים; שיעור בלי בלוקים = ריק', () => {
    const l = lesson('l1', [
      textBlock(`<p><span data-concept-id="${A}">מיקסר</span></p>`),
      textBlock(`<p><span data-concept-id="${B}">רכזת</span></p>`),
    ])
    expect(conceptIdsInLesson(l).sort()).toEqual([A, B].sort())
    expect(conceptIdsInLesson(lesson('l2', null))).toEqual([])
    expect(conceptIdsInLesson(lesson('l3', []))).toEqual([])
  })
})

describe('buildConceptBacklinks', () => {
  it('ממפה מונח → כל השיעורים שבהם הוא מסומן', () => {
    const lessons = [
      lesson('l1', [textBlock(`<span data-concept-id="${A}">מיקסר</span>`)]),
      lesson('l2', [textBlock(`<span data-concept-id="${A}">ממיקסרים</span>`)]),
      lesson('l3', [textBlock(`<span data-concept-id="${B}">רכזת</span>`)]),
    ]
    const map = buildConceptBacklinks(lessons)
    expect(map.get(A)?.map((l) => l.id)).toEqual(['l1', 'l2'])
    expect(map.get(B)?.map((l) => l.id)).toEqual(['l3'])
    expect(map.has('unknown')).toBe(false)
  })
})
