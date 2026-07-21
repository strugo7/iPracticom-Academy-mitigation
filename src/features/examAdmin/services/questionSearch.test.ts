import { describe, expect, it } from 'vitest'
import type { Question } from '@/types/entities'
import { EMPTY_QUESTION_FILTERS } from '../types'
import { categoryOptions, filterQuestions } from './questionSearch'

const dates = { created_date: '2026-01-01T00:00:00.000Z', updated_date: '2026-01-01T00:00:00.000Z' }

function q(id: string, over: Partial<Question>): Question {
  return {
    id,
    question_text: `שאלה ${id}`,
    question_type: 'multiple_choice',
    category: 'רשתות',
    ...dates,
    ...over,
  }
}

const list = [
  q('1', { question_text: 'מהי כתובת MikroTik', category: 'רשתות', status: 'published' }),
  q('2', { category: 'מצלמות אבטחה', question_type: 'true_false', status: 'draft' }),
  q('3', { category: 'כלל החברה', difficulty_level: 'advanced' }),
]

describe('filterQuestions', () => {
  it('חיפוש בנוסח', () => {
    const r = filterQuestions(list, { ...EMPTY_QUESTION_FILTERS, search: 'MikroTik' })
    expect(r.map((x) => x.id)).toEqual(['1'])
  })
  it('סינון לפי סוג', () => {
    const r = filterQuestions(list, { ...EMPTY_QUESTION_FILTERS, questionType: 'true_false' })
    expect(r.map((x) => x.id)).toEqual(['2'])
  })
  it('סינון לפי סטטוס', () => {
    const r = filterQuestions(list, { ...EMPTY_QUESTION_FILTERS, status: 'draft' })
    expect(r.map((x) => x.id)).toEqual(['2'])
  })
})

describe('categoryOptions', () => {
  it("'כלל החברה' ראשונה, השאר ממוין", () => {
    expect(categoryOptions(list)).toEqual(['כלל החברה', 'מצלמות אבטחה', 'רשתות'])
  })
})
