import { describe, expect, it } from 'vitest'
import type { Question } from '@/types/entities'
import { buildShuffleForExam, mulberry32, shuffledIndices } from './shuffle'

function makeQuestion(overrides: Partial<Question> & { id: string }): Question {
  return {
    created_date: '2026-01-01T00:00:00.000Z',
    updated_date: '2026-01-01T00:00:00.000Z',
    question_text: 'שאלה',
    question_type: 'multiple_choice',
    category: 'כלל החברה',
    options: ['א', 'ב', 'ג'],
    ...overrides,
  }
}

describe('mulberry32', () => {
  it('is deterministic for the same seed', () => {
    const seqA = Array.from({ length: 5 }, mulberry32(42))
    const seqB = Array.from({ length: 5 }, mulberry32(42))
    expect(seqA).toEqual(seqB)
  })

  it('differs across seeds', () => {
    const rngA = mulberry32(1)
    const rngB = mulberry32(2)
    expect(rngA()).not.toBe(rngB())
  })
})

describe('shuffledIndices', () => {
  it('returns identity order when shuffle is false', () => {
    expect(shuffledIndices(5, mulberry32(7), false)).toEqual([0, 1, 2, 3, 4])
  })

  it('returns a valid permutation when shuffle is true', () => {
    const result = shuffledIndices(6, mulberry32(7), true)
    expect([...result].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('is deterministic for the same seed', () => {
    expect(shuffledIndices(8, mulberry32(99), true)).toEqual(
      shuffledIndices(8, mulberry32(99), true),
    )
  })
})

describe('buildShuffleForExam', () => {
  const questions = [
    makeQuestion({ id: 'q1', options: ['א', 'ב'] }),
    makeQuestion({ id: 'q2', options: ['א', 'ב', 'ג'] }),
    makeQuestion({
      id: 'q3',
      question_type: 'order_sequence',
      options: [],
      order_items: [
        { id: 'i1', text: 'שלב 1' },
        { id: 'i2', text: 'שלב 2' },
        { id: 'i3', text: 'שלב 3' },
      ],
    }),
  ]

  it('keeps canonical question order when shuffle_questions is false', () => {
    const result = buildShuffleForExam(
      { shuffle_questions: false, shuffle_answers: false },
      questions,
      1,
    )
    expect(result.questionOrder).toEqual(['q1', 'q2', 'q3'])
  })

  it('keeps identity answer order per question when shuffle_answers is false', () => {
    const result = buildShuffleForExam(
      { shuffle_questions: false, shuffle_answers: false },
      questions,
      1,
    )
    expect(result.answerOrders.q1).toEqual([0, 1])
    expect(result.answerOrders.q2).toEqual([0, 1, 2])
    expect(result.answerOrders.q3).toEqual([0, 1, 2])
  })

  it('produces a question-order permutation when shuffle_questions is true', () => {
    const result = buildShuffleForExam(
      { shuffle_questions: true, shuffle_answers: false },
      questions,
      7,
    )
    expect([...result.questionOrder].sort()).toEqual(['q1', 'q2', 'q3'])
  })

  it('is fully deterministic for the same exam + seed', () => {
    const a = buildShuffleForExam(
      { shuffle_questions: true, shuffle_answers: true },
      questions,
      123,
    )
    const b = buildShuffleForExam(
      { shuffle_questions: true, shuffle_answers: true },
      questions,
      123,
    )
    expect(a).toEqual(b)
  })
})
