/** בדיקת attemptService בלי React — fake IResource במקום MockApi (מהיר, נשלט). */
import { describe, expect, it } from 'vitest'
import type { IApiClient, IResource } from '@/lib/api'
import type { BaseEntity, Exam, ExamAttempt, Question, UserProgress } from '@/types/entities'
import {
  saveProgress,
  scoreAttempt,
  startOrResumeAttempt,
  submitAttempt,
} from './attemptService'

function fakeResource<T extends BaseEntity>(initial: T[] = []): IResource<T> {
  const rows = [...initial]
  let nextId = 1
  return {
    async findById(id) {
      return rows.find((r) => r.id === id) ?? null
    },
    async findMany(query = {}) {
      const { filter } = query
      return filter
        ? rows.filter((r) =>
            Object.entries(filter).every(
              ([k, v]) => (r as Record<string, unknown>)[k] === v,
            ),
          )
        : [...rows]
    },
    async create(data) {
      const record = {
        ...data,
        id: `id-${nextId++}`,
        created_date: '',
        updated_date: '',
      } as T
      rows.push(record)
      return record
    },
    async update(id, patch) {
      const index = rows.findIndex((r) => r.id === id)
      if (index === -1) throw new Error('not found')
      rows[index] = { ...rows[index], ...patch }
      return rows[index]
    },
    async delete(id) {
      const index = rows.findIndex((r) => r.id === id)
      if (index !== -1) rows.splice(index, 1)
    },
    async count(filter) {
      return (await this.findMany({ filter })).length
    },
  }
}

function makeExam(overrides: Partial<Exam> = {}): Exam {
  return {
    id: 'e1',
    exam_id: 'e1',
    title: 'מבחן',
    status: 'published',
    passing_score: 70,
    max_attempts: 2,
    shuffle_questions: false,
    shuffle_answers: false,
    created_date: '',
    updated_date: '',
    ...overrides,
  }
}

function makeMcQuestion(id: string, correctIndex: number, points = 1): Question {
  return {
    id,
    created_date: '',
    updated_date: '',
    question_text: `שאלה ${id}`,
    question_type: 'multiple_choice',
    category: 'כלל החברה',
    options: ['א', 'ב', 'ג'],
    correct_answer_index: correctIndex,
    points,
  }
}

function makeOrderQuestion(id: string, points = 1): Question {
  return {
    id,
    created_date: '',
    updated_date: '',
    question_text: `שאלה ${id}`,
    question_type: 'order_sequence',
    category: 'כלל החברה',
    options: [],
    order_items: [
      { id: 'i1', text: 'א' },
      { id: 'i2', text: 'ב' },
      { id: 'i3', text: 'ג' },
    ],
    points,
  }
}

function fakeApi(overrides: {
  examAttempts?: ExamAttempt[]
  userProgress?: UserProgress[]
} = {}): IApiClient {
  return {
    examAttempts: fakeResource<ExamAttempt>(overrides.examAttempts ?? []),
    userProgress: fakeResource<UserProgress>(overrides.userProgress ?? []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any
}

describe('scoreAttempt', () => {
  it('מחשב ניקוד נכון עבור multiple_choice/true_false', () => {
    const questions = [makeMcQuestion('q1', 0), makeMcQuestion('q2', 1)]
    const result = scoreAttempt({ passing_score: 70 }, questions, {
      q1: 0,
      q2: 2,
    })
    expect(result.score).toBe(50)
    expect(result.passed).toBe(false)
    expect(result.detailedResults.questions[0].is_correct).toBe(true)
    expect(result.detailedResults.questions[1].is_correct).toBe(false)
  })

  it('מחשב ניקוד נכון עבור order_sequence — התאמת רצף מדויקת בלבד', () => {
    const questions = [makeOrderQuestion('q1')]
    const correct = scoreAttempt({ passing_score: 70 }, questions, {
      q1: ['i1', 'i2', 'i3'],
    })
    expect(correct.score).toBe(100)
    const wrong = scoreAttempt({ passing_score: 70 }, questions, {
      q1: ['i2', 'i1', 'i3'],
    })
    expect(wrong.score).toBe(0)
  })

  it('לא נענתה נחשבת שגויה, לא זורקת', () => {
    const questions = [makeMcQuestion('q1', 0)]
    const result = scoreAttempt({ passing_score: 70 }, questions, {})
    expect(result.detailedResults.questions[0].is_correct).toBe(false)
  })
})

describe('startOrResumeAttempt', () => {
  const questions = [makeMcQuestion('q1', 0)]

  it('יוצר ניסיון חדש כשאין ניסיון קודם', async () => {
    const api = fakeApi()
    const attempt = await startOrResumeAttempt({
      api,
      userId: 'u1',
      exam: makeExam(),
      questions,
    })
    expect(attempt.status).toBe('in_progress')
    expect(attempt.attempt_number).toBe(1)
    expect(attempt.question_order).toEqual(['q1'])
  })

  it('ממשיך ניסיון in_progress קיים במקום ליצור חדש', async () => {
    const existing: ExamAttempt = {
      id: 'a1',
      exam_id: 'e1',
      user_id: 'u1',
      attempt_number: 1,
      status: 'in_progress',
      created_date: '',
      updated_date: '',
    }
    const api = fakeApi({ examAttempts: [existing] })
    const attempt = await startOrResumeAttempt({
      api,
      userId: 'u1',
      exam: makeExam(),
      questions,
    })
    expect(attempt.id).toBe('a1')
  })

  it('חוסם ניסיון חדש כשמוצה מספר הניסיונות המרבי', async () => {
    const finished: ExamAttempt[] = [
      {
        id: 'a1',
        exam_id: 'e1',
        user_id: 'u1',
        attempt_number: 1,
        status: 'completed',
        created_date: '',
        updated_date: '',
      },
      {
        id: 'a2',
        exam_id: 'e1',
        user_id: 'u1',
        attempt_number: 2,
        status: 'timed_out',
        created_date: '',
        updated_date: '',
      },
    ]
    const api = fakeApi({ examAttempts: finished })
    await expect(
      startOrResumeAttempt({
        api,
        userId: 'u1',
        exam: makeExam({ max_attempts: 2 }),
        questions,
      }),
    ).rejects.toMatchObject({ code: 'validation' })
  })
})

describe('saveProgress', () => {
  it('שומר current_index/user_answers על הניסיון', async () => {
    const api = fakeApi({
      examAttempts: [
        {
          id: 'a1',
          exam_id: 'e1',
          user_id: 'u1',
          attempt_number: 1,
          status: 'in_progress',
          created_date: '',
          updated_date: '',
        },
      ],
    })
    await saveProgress(api, 'a1', { currentIndex: 2, userAnswers: { q1: 0 } })
    const updated = await api.examAttempts.findById('a1')
    expect(updated?.current_index).toBe(2)
    expect(updated?.user_answers).toEqual({ q1: 0 })
  })
})

describe('submitAttempt', () => {
  it('כותב completed + exam_attempt + exam_passed כשעובר', async () => {
    const attempt: ExamAttempt = {
      id: 'a1',
      exam_id: 'e1',
      user_id: 'u1',
      attempt_number: 1,
      status: 'in_progress',
      started_at: new Date(Date.now() - 60_000).toISOString(),
      user_answers: { q1: 0 },
      created_date: '',
      updated_date: '',
    }
    const api = fakeApi({ examAttempts: [attempt] })
    const updated = await submitAttempt({
      api,
      userId: 'u1',
      attempt,
      exam: makeExam(),
      questions: [makeMcQuestion('q1', 0)],
      reason: 'manual',
    })
    expect(updated.status).toBe('completed')
    expect(updated.passed).toBe(true)
    expect(updated.score).toBe(100)

    const events = await api.userProgress.findMany({
      filter: { user_id: 'u1' },
    })
    expect(events.map((e) => e.progress_type).sort()).toEqual([
      'exam_attempt',
      'exam_passed',
    ])
  })

  it('כותב timed_out ולא exam_passed כשלא עובר', async () => {
    const attempt: ExamAttempt = {
      id: 'a1',
      exam_id: 'e1',
      user_id: 'u1',
      attempt_number: 1,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      user_answers: {},
      created_date: '',
      updated_date: '',
    }
    const api = fakeApi({ examAttempts: [attempt] })
    const updated = await submitAttempt({
      api,
      userId: 'u1',
      attempt,
      exam: makeExam(),
      questions: [makeMcQuestion('q1', 0)],
      reason: 'timeout',
    })
    expect(updated.status).toBe('timed_out')
    expect(updated.passed).toBe(false)

    const events = await api.userProgress.findMany({
      filter: { user_id: 'u1' },
    })
    expect(events.map((e) => e.progress_type)).toEqual(['exam_attempt'])
  })
})
