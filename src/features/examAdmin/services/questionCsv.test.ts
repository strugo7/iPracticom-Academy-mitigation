import { describe, expect, it } from 'vitest'
import type { Question } from '@/types/entities'
import { parseCsv, toCsv } from './csv'
import { csvRowsToQuestionInputs, questionsToCsvRows } from './questionCsv'

const dates = { created_date: '2026-01-01T00:00:00.000Z', updated_date: '2026-01-01T00:00:00.000Z' }

const mc: Question = {
  id: 'q1',
  question_text: 'מהי כתובת MikroTik?',
  question_type: 'multiple_choice',
  category: 'רשתות',
  difficulty_level: 'beginner',
  points: 5,
  status: 'published',
  options: ['192.168.88.1', '192.168.1.1'],
  correct_answer_index: 0,
  topic_tags: ['MikroTik'],
  explanation: 'ברירת המחדל',
  ...dates,
}

describe('questionsToCsvRows → CSV → parse → inputs (round-trip)', () => {
  it('שאלת רב-ברירה עוברת שלמה', () => {
    const csv = toCsv(questionsToCsvRows([mc]))
    const { inputs, errors } = csvRowsToQuestionInputs(parseCsv(csv))
    expect(errors).toEqual([])
    expect(inputs).toHaveLength(1)
    expect(inputs[0]).toMatchObject({
      question_text: 'מהי כתובת MikroTik?',
      question_type: 'multiple_choice',
      category: 'רשתות',
      options: ['192.168.88.1', '192.168.1.1'],
      correct_answer_index: 0,
      points: 5,
    })
  })
})

describe('csvRowsToQuestionInputs', () => {
  it('כותרת חסרה עמודת-חובה → שגיאה', () => {
    const { errors } = csvRowsToQuestionInputs([
      ['question_text', 'category'],
      ['שאלה', 'רשתות'],
    ])
    expect(errors[0].messages[0]).toContain('question_type')
  })

  it('שורה לא-תקינה מדווחת ולא נכללת', () => {
    const rows = [
      ['question_text', 'question_type', 'category', 'options', 'correct_answer_index'],
      ['שאלה טובה', 'multiple_choice', 'רשתות', 'א | ב', '1'],
      ['', 'multiple_choice', 'רשתות', 'א | ב', '0'], // נוסח ריק
    ]
    const { inputs, errors } = csvRowsToQuestionInputs(rows)
    expect(inputs).toHaveLength(1)
    expect(errors).toHaveLength(1)
    expect(errors[0].line).toBe(3)
  })

  it('סובלני לסדר-עמודות', () => {
    const rows = [
      ['category', 'question_type', 'question_text', 'options', 'correct_answer_index'],
      ['רשתות', 'true_false', 'DHCP מקצה IP', 'נכון | לא נכון', '0'],
    ]
    const { inputs } = csvRowsToQuestionInputs(rows)
    expect(inputs[0].question_type).toBe('true_false')
    expect(inputs[0].correct_answer_index).toBe(0)
  })
})
