/**
 * parseBlockData מול הגיבוי האמיתי (89 שיעורים, 76 v2) — מוודא שכל מופע אמיתי
 * של כל אחד מ-22 סוגי-הבלוקים בעלי דאטה (מסמך CLEANUP_MAP/מחקר 3.2) עובר
 * parse בהצלחה, ושה-fallback (alias/type לא-מוכר/parse כושל) לעולם לא זורק.
 */
import { describe, expect, it } from 'vitest'
import { createMockResource } from '@/lib/api/mock/mockApi'
import { moduleLessonSchema } from '@/lib/api/schemas'
import { parseBlockData } from './blockSchemas'

async function loadAllBlocks() {
  const lessons = await createMockResource(
    'ModuleLesson',
    moduleLessonSchema,
  ).findMany()
  return lessons.flatMap((lesson) => lesson.blocks ?? [])
}

describe('parseBlockData מול הגיבוי האמיתי', () => {
  it('כל מופע אמיתי מ-22 סוגי-הבלוקים עם דאטה עובר parse בהצלחה', async () => {
    const blocks = await loadAllBlocks()
    expect(blocks.length).toBeGreaterThan(0)

    const failures: string[] = []
    for (const block of blocks) {
      const parsed = parseBlockData(block.type, block.data)
      if (parsed === null) failures.push(`${block.type} (${block.id})`)
    }
    expect(failures).toEqual([])
  }, 20000)

  it('היסטוגרמת הסוגים האמיתית תואמת את המחקר המקדים (22 סוגים עם דאטה)', async () => {
    const blocks = await loadAllBlocks()
    const counts = new Map<string, number>()
    for (const block of blocks) {
      counts.set(block.type, (counts.get(block.type) ?? 0) + 1)
    }
    expect(counts.get('heading')).toBe(267)
    expect(counts.get('text')).toBe(241)
    expect(counts.get('image')).toBe(80)
    expect(counts.get('network_canvas')).toBe(2)
    expect(counts.get('interactive_widget')).toBe(1)
    expect(counts.get('video')).toBe(4)
    // 0 מופעים אמיתיים — עדיין נבדקים ידנית למטה מול הצורה הספציפית-בלבד.
    expect(counts.get('pdf')).toBeUndefined()
    expect(counts.get('lesson_cover')).toBeUndefined()
    expect(counts.get('graph')).toBeUndefined()
    expect(counts.get('divider')).toBeUndefined()
  }, 20000)

  it('divider הוא alias של separator', () => {
    const data = { thickness: 2, width: '100%' }
    expect(parseBlockData('divider', data)).toEqual(
      parseBlockData('separator', data),
    )
  })

  it('graph וסוג לא-מוכר תמיד מחזירים null (fallback, לא זריקה)', () => {
    expect(parseBlockData('graph', { anything: true })).toBeNull()
    expect(parseBlockData('not_a_real_type', {})).toBeNull()
  })

  it('דאטה פגום עבור סוג ידוע מחזיר null ולא זורק', () => {
    expect(parseBlockData('text', { content: 123 })).toBeNull()
    expect(parseBlockData('quiz', { questions: 'not-an-array' })).toBeNull()
  })

  it('page_break מקבל מעטפת ריקה', () => {
    expect(parseBlockData('page_break', {})).toEqual({})
  })
})
