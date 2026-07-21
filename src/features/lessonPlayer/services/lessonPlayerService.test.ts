/**
 * בדיקת fetchLessonPlayerInput/isPlayableLesson בלי React — מראה
 * useTrackDetails.test.ts.
 */
import { describe, expect, it } from 'vitest'
import type { IApiClient } from '@/lib/api'
import type { Exam, ModuleLesson } from '@/types/entities'
import { fetchLessonPlayerInput, isPlayableLesson } from './lessonPlayerService'

const LESSON_ID = 'l1'
const lessonV2: ModuleLesson = {
  id: LESSON_ID,
  title: 'שיעור',
  editor_version: 'v2',
  blocks: [
    {
      id: 'b1',
      type: 'text',
      order_index: 0,
      data: { content: 'שלום' },
    },
  ],
  created_date: '',
  updated_date: '',
}

function fakeApi(
  overrides: { lesson?: ModuleLesson | null; exam?: Exam | null } = {},
): IApiClient {
  const empty = { findMany: async () => [] }
  return {
    moduleLessons: {
      findById: async () =>
        overrides.lesson === undefined ? lessonV2 : overrides.lesson,
    },
    exams: {
      findById: async () =>
        overrides.exam === undefined ? null : overrides.exam,
    },
    learningTracks: empty,
    trackModules: empty,
    sharedModules: empty,
    topics: empty,
    userProgress: empty,
    users: empty,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any
}

describe('fetchLessonPlayerInput', () => {
  it('מחזיר את השיעור בלי מבחן מקושר', async () => {
    const result = await fetchLessonPlayerInput(fakeApi(), LESSON_ID)
    expect(result.lesson).toEqual(lessonV2)
    expect(result.linkedExam).toBeNull()
  })

  it('טוען את המבחן המקושר כש-linked_exam_id קיים', async () => {
    const exam: Exam = {
      id: 'e1',
      exam_id: 'e1',
      title: 'מבחן',
      created_date: '',
      updated_date: '',
    }
    const lessonWithExam = { ...lessonV2, linked_exam_id: 'e1' }
    const result = await fetchLessonPlayerInput(
      fakeApi({ lesson: lessonWithExam, exam }),
      LESSON_ID,
    )
    expect(result.linkedExam).toEqual(exam)
  })

  it('זורק ApiError not_found כשהשיעור לא קיים', async () => {
    await expect(
      fetchLessonPlayerInput(fakeApi({ lesson: null }), LESSON_ID),
    ).rejects.toMatchObject({ code: 'not_found' })
  })
})

describe('isPlayableLesson', () => {
  it('true עבור v2 עם blocks לא-ריק', () => {
    expect(isPlayableLesson(lessonV2)).toBe(true)
  })

  it('false עבור v1/legacy (בלי editor_version)', () => {
    expect(isPlayableLesson({ ...lessonV2, editor_version: undefined })).toBe(
      false,
    )
  })

  it('false עבור v2 עם blocks ריק או חסר', () => {
    expect(isPlayableLesson({ ...lessonV2, blocks: [] })).toBe(false)
    expect(isPlayableLesson({ ...lessonV2, blocks: undefined })).toBe(false)
  })
})
