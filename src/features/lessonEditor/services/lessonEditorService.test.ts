import { describe, expect, it } from 'vitest'
import type { EditorBlock } from '../types'
import {
  buildNewBlock,
  buildSnapshot,
  deleteBlock,
  duplicateBlock,
  insertBlock,
  isEditableLesson,
  reorderByIds,
  setBlockData,
  setBlockStyling,
  setBlockVisibility,
} from './lessonEditorService'

const block = (id: string, type = 'text'): EditorBlock => ({
  id,
  type,
  order_index: 0,
  data: { content: id },
  styling: null,
  visibility: null,
})

const seq = (...ids: string[]) => ids.map((id) => block(id))

describe('buildNewBlock', () => {
  it('creates a block with a unique id and default data', () => {
    const a = buildNewBlock('heading')
    const b = buildNewBlock('heading')
    expect(a.id).not.toBe(b.id)
    expect(a.type).toBe('heading')
    expect(a.data).toMatchObject({ level: 2 })
  })

  it('falls back to empty data for types without a default', () => {
    expect(buildNewBlock('unknown_block_type').data).toEqual({})
  })

  it('seeds editable defaults for 6.3 media/structure types', () => {
    expect(buildNewBlock('image').data).toMatchObject({ url: '', alt: '', caption: '' })
    expect(buildNewBlock('table').data).toMatchObject({
      headers: ['עמודה 1', 'עמודה 2'],
    })
    expect(buildNewBlock('lesson_cover').data).toMatchObject({ title: '', gradient: null })
    expect(buildNewBlock('page_break').data).toEqual({})
  })
})

describe('setBlockData', () => {
  it('shallow-merges a data patch onto the selected block only', () => {
    const next = setBlockData(seq('a', 'b'), 'a', { content: 'edited', level: 3 })
    expect(next[0].data).toEqual({ content: 'edited', level: 3 })
    expect(next[1].data).toEqual({ content: 'b' })
  })

  it('returns blocks unchanged in identity for other blocks', () => {
    const input = seq('a', 'b')
    const next = setBlockData(input, 'a', { content: 'x' })
    expect(next[1]).toBe(input[1])
  })
})

describe('insertBlock', () => {
  it('inserts at the index and reindexes order_index', () => {
    const next = insertBlock(seq('a', 'b'), 'heading', 1)
    expect(next.map((x) => x.type)).toEqual(['text', 'heading', 'text'])
    expect(next.map((x) => x.order_index)).toEqual([0, 1, 2])
  })

  it('clamps an out-of-range index to the end', () => {
    const next = insertBlock(seq('a'), 'quote', 99)
    expect(next[1].type).toBe('quote')
  })
})

describe('duplicateBlock', () => {
  it('places a copy with a new id right after the original', () => {
    const next = duplicateBlock(seq('a', 'b'), 'a')
    expect(next).toHaveLength(3)
    expect(next[1].id).not.toBe('a')
    expect(next[1].data).toEqual({ content: 'a' })
    expect(next.map((x) => x.order_index)).toEqual([0, 1, 2])
  })

  it('returns the input unchanged for an unknown id', () => {
    const input = seq('a')
    expect(duplicateBlock(input, 'x')).toBe(input)
  })
})

describe('deleteBlock', () => {
  it('removes the block and reindexes', () => {
    const next = deleteBlock(seq('a', 'b', 'c'), 'b')
    expect(next.map((x) => x.id)).toEqual(['a', 'c'])
    expect(next.map((x) => x.order_index)).toEqual([0, 1])
  })
})

describe('reorderByIds', () => {
  it('moves active before over and reindexes', () => {
    const next = reorderByIds(seq('a', 'b', 'c'), 'c', 'a')
    expect(next.map((x) => x.id)).toEqual(['c', 'a', 'b'])
    expect(next.map((x) => x.order_index)).toEqual([0, 1, 2])
  })

  it('is a no-op when active equals over', () => {
    const input = seq('a', 'b')
    expect(reorderByIds(input, 'a', 'a')).toBe(input)
  })
})

describe('setBlockStyling', () => {
  it('merges a patch onto the selected block', () => {
    const next = setBlockStyling(seq('a'), 'a', { textColor: '#0075DB' })
    expect(next[0].styling).toEqual({ textColor: '#0075DB' })
  })

  it('removes a key when patched with null and nulls empty styling', () => {
    const styled = setBlockStyling(seq('a'), 'a', { fontSize: '1.25rem' })
    const cleared = setBlockStyling(styled, 'a', { fontSize: null })
    expect(cleared[0].styling).toBeNull()
  })
})

describe('setBlockVisibility', () => {
  it('toggles the hidden flag', () => {
    const hidden = setBlockVisibility(seq('a'), 'a', true)
    expect(hidden[0].visibility).toEqual({ hidden: true })
  })
})

describe('buildSnapshot', () => {
  it('captures settings + a deep copy of blocks', () => {
    const blocks = seq('a')
    const snap = buildSnapshot(
      {
        title: 'שיעור',
        introduction_text: '',
        learning_objectives: ['מטרה'],
        duration_minutes: 9,
        xp_reward: 50,
        require_previous_lesson: false,
        linked_exam_id: null,
        status: 'draft',
      },
      blocks,
    )
    expect(snap.title).toBe('שיעור')
    expect(snap.introduction_text).toBeNull()
    expect(snap.blocks).toEqual(blocks)
    expect(snap.blocks).not.toBe(blocks)
  })
})

describe('isEditableLesson', () => {
  const base = {
    id: 'l1',
    created_date: '2026-01-01T00:00:00.000Z',
    updated_date: '2026-01-01T00:00:00.000Z',
  }
  it('accepts v2 lessons even when empty', () => {
    expect(isEditableLesson({ ...base, editor_version: 'v2' })).toBe(true)
  })
  it('accepts any lesson carrying blocks', () => {
    expect(isEditableLesson({ ...base, blocks: [block('a')] })).toBe(true)
  })
  it('rejects a v1 lesson with no blocks', () => {
    expect(isEditableLesson({ ...base, editor_version: 'v1' })).toBe(false)
  })
})
