import { describe, expect, it } from 'vitest'
import type { LessonBlockEnvelope } from '@/types/entities'
import {
  blockAnchorId,
  buildToc,
  estimateReadingMinutes,
  sortedBlocks,
} from './policyViewerService'

const block = (
  id: string,
  type: string,
  data: Record<string, unknown>,
  order = 0,
): LessonBlockEnvelope => ({ id, type, order_index: order, data })

const blocks: LessonBlockEnvelope[] = [
  block('b1', 'heading', { text: 'מטרת הנוהל', level: 2 }, 0),
  block('b2', 'text', { content: '<p>פסקה עם כמה מילים כאן.</p>' }, 1),
  block('b3', 'heading', { text: 'שלבי ביצוע', level: 2 }, 2),
  block('b4', 'list', { items: ['פריט ראשון', 'פריט שני'] }, 3),
]

describe('buildToc', () => {
  it('בונה תוכן-עניינים ממוספר מבלוקי-הכותרת בלבד', () => {
    const toc = buildToc(blocks)
    expect(toc).toHaveLength(2)
    expect(toc[0]).toEqual({
      anchor: blockAnchorId('b1'),
      label: 'מטרת הנוהל',
      index: 1,
    })
    expect(toc[1]?.index).toBe(2)
  })

  it('מתעלם מכותרת ריקה', () => {
    const toc = buildToc([block('x', 'heading', { text: '   ' })])
    expect(toc).toHaveLength(0)
  })
})

describe('estimateReadingMinutes', () => {
  it('מחזיר מינימום דקה אחת גם לתוכן קצר', () => {
    expect(estimateReadingMinutes(blocks)).toBeGreaterThanOrEqual(1)
  })
})

describe('sortedBlocks', () => {
  it('ממיין לפי order_index ומטפל ב-null', () => {
    const unsorted = [block('b', 'text', {}, 2), block('a', 'text', {}, 1)]
    expect(sortedBlocks(unsorted).map((b) => b.id)).toEqual(['a', 'b'])
    expect(sortedBlocks(null)).toEqual([])
  })
})
