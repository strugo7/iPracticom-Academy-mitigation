import { describe, expect, it } from 'vitest'
import type { Question } from '@/types/entities'
import {
  draftFromQuestion,
  emptyQuestionDraft,
  questionInputFromDraft,
  validateQuestionDraft,
} from './questionForm'

const dates = {
  created_date: '2026-01-01T00:00:00.000Z',
  updated_date: '2026-01-01T00:00:00.000Z',
}

const mcQuestion: Question = {
  id: 'q1',
  question_text: 'מהי כתובת ברירת המחדל של MikroTik?',
  question_type: 'multiple_choice',
  category: 'רשתות',
  options: ['192.168.88.1', '192.168.1.1', '10.0.0.1'],
  correct_answer_index: 0,
  difficulty_level: 'beginner',
  points: 5,
  status: 'published',
  usage_count: 3,
  ...dates,
}

describe('draftFromQuestion → questionInputFromDraft (round-trip)', () => {
  it('שומר על שדות רב-ברירה', () => {
    const draft = draftFromQuestion(mcQuestion)
    expect(draft.questionType).toBe('multiple_choice')
    expect(draft.options).toEqual(['192.168.88.1', '192.168.1.1', '10.0.0.1'])
    expect(draft.correctIndex).toBe(0)

    const input = questionInputFromDraft(draft)
    expect(input.options).toEqual(['192.168.88.1', '192.168.1.1', '10.0.0.1'])
    expect(input.correct_answer_index).toBe(0)
    expect(input.order_items).toBeNull()
    expect(input.points).toBe(5)
  })

  it('נכון/לא-נכון: correct_answer_index 0 = "נכון"', () => {
    const draft = draftFromQuestion({
      ...mcQuestion,
      question_type: 'true_false',
      options: ['נכון', 'לא נכון'],
      correct_answer_index: 1,
    })
    expect(draft.trueFalseCorrect).toBe(false)

    const input = questionInputFromDraft({ ...draft, trueFalseCorrect: true })
    expect(input.options).toEqual(['נכון', 'לא נכון'])
    expect(input.correct_answer_index).toBe(0)
  })

  it('סידור: options ריק, correct_answer_index null, order_items נשמר', () => {
    const draft = draftFromQuestion({
      ...mcQuestion,
      question_type: 'order_sequence',
      options: [],
      correct_answer_index: null,
      order_items: [
        { id: 'a', text: 'שלב 1' },
        { id: 'b', text: 'שלב 2' },
      ],
    })
    const input = questionInputFromDraft(draft)
    expect(input.options).toEqual([])
    expect(input.correct_answer_index).toBeNull()
    expect(input.order_items).toEqual([
      { id: 'a', text: 'שלב 1' },
      { id: 'b', text: 'שלב 2' },
    ])
  })
})

describe('validateQuestionDraft', () => {
  it('טיוטה ריקה — חסר נוסח', () => {
    const errors = validateQuestionDraft(emptyQuestionDraft())
    expect(errors).toContain('יש להזין את נוסח השאלה')
  })

  it('רב-ברירה עם פחות משתי תשובות מלאות — נכשל', () => {
    const draft = { ...emptyQuestionDraft(), questionText: 'שאלה', options: ['רק אחת', ''] }
    expect(validateQuestionDraft(draft)).toContain('יש להזין לפחות 2 תשובות')
  })

  it('רב-ברירה תקינה — עובר', () => {
    const draft = {
      ...emptyQuestionDraft(),
      questionText: 'שאלה',
      options: ['א', 'ב'],
      correctIndex: 1,
    }
    expect(validateQuestionDraft(draft)).toEqual([])
  })

  it('ניקוד לא-חיובי נפסל', () => {
    const draft = { ...emptyQuestionDraft(), questionText: 'שאלה', options: ['א', 'ב'], points: 0 }
    expect(validateQuestionDraft(draft)).toContain('הניקוד חייב להיות מספר שלם חיובי')
  })
})
