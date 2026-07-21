/** בדיקת fetchExamPlayerInput בלי React — מראה lessonPlayerService.test.ts */
import { describe, expect, it } from 'vitest'
import type { IApiClient } from '@/lib/api'
import type { Exam, Question } from '@/types/entities'
import { fetchExamPlayerInput } from './examPlayerService'

const EXAM_ID = 'e1'

function makeQuestion(id: string): Question {
  return {
    id,
    created_date: '',
    updated_date: '',
    question_text: `שאלה ${id}`,
    question_type: 'multiple_choice',
    category: 'כלל החברה',
    options: ['א', 'ב'],
    correct_answer_index: 0,
  }
}

function fakeApi(overrides: {
  exam?: Exam | null
  questionsById?: Record<string, Question | null>
}): IApiClient {
  const questionsById = overrides.questionsById ?? {}
  return {
    exams: {
      findById: async () =>
        overrides.exam === undefined ? null : overrides.exam,
    },
    questions: {
      findById: async (id: string) => questionsById[id] ?? null,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any
}

function makeExam(overrides: Partial<Exam> = {}): Exam {
  return {
    id: EXAM_ID,
    exam_id: EXAM_ID,
    title: 'מבחן',
    status: 'published',
    created_date: '',
    updated_date: '',
    questions: [
      { question_id: 'q2', order_index: 1, points: 1 },
      { question_id: 'q1', order_index: 0, points: 1 },
    ],
    ...overrides,
  }
}

describe('fetchExamPlayerInput', () => {
  it('טוען את המבחן ואת שאלותיו לפי order_index', async () => {
    const result = await fetchExamPlayerInput(
      fakeApi({
        exam: makeExam(),
        questionsById: { q1: makeQuestion('q1'), q2: makeQuestion('q2') },
      }),
      EXAM_ID,
    )
    expect(result.questions.map((q) => q.id)).toEqual(['q1', 'q2'])
  })

  it('זורק ApiError not_found כשהמבחן לא קיים', async () => {
    await expect(
      fetchExamPlayerInput(fakeApi({ exam: null }), EXAM_ID),
    ).rejects.toMatchObject({ code: 'not_found' })
  })

  it('זורק ApiError not_found כשהמבחן אינו published', async () => {
    await expect(
      fetchExamPlayerInput(
        fakeApi({ exam: makeExam({ status: 'draft' }) }),
        EXAM_ID,
      ),
    ).rejects.toMatchObject({ code: 'not_found' })
  })

  it('זורק ApiError not_found כששאלה מקושרת חסרה', async () => {
    await expect(
      fetchExamPlayerInput(
        fakeApi({
          exam: makeExam(),
          questionsById: { q1: makeQuestion('q1') },
        }),
        EXAM_ID,
      ),
    ).rejects.toMatchObject({ code: 'not_found' })
  })
})
