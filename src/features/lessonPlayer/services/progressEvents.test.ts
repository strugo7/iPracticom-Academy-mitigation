/**
 * בדיקת רצף אירועי ההתקדמות — הלוגיקה העדינה ביותר בפיצ'ר (dedup, השלמת
 * topic/track רק כשהכול הושלם, module_completed לעולם לא נכתב).
 */
import { describe, expect, it } from 'vitest'
import type { IApiClient } from '@/lib/api'
import type {
  ModuleLesson,
  Topic,
  TrackModule,
  UserProgress,
} from '@/types/entities'
import { completeLesson, ensureLessonStarted } from './progressEvents'

const USER_ID = 'u1'
const TRACK_ID = 't1'

const trackModules: TrackModule[] = [
  {
    id: 'tm1',
    track_id: TRACK_ID,
    shared_module_id: 'm1',
    created_date: '',
    updated_date: '',
  },
]
const topics: Topic[] = [
  {
    id: 'top1',
    shared_module_id: 'm1',
    created_date: '',
    updated_date: '',
  },
]
const lessonA: ModuleLesson = {
  id: 'lA',
  topic_id: 'top1',
  status: 'published',
  created_date: '',
  updated_date: '',
}
const lessonB: ModuleLesson = {
  id: 'lB',
  topic_id: 'top1',
  status: 'published',
  created_date: '',
  updated_date: '',
}
const lessons: ModuleLesson[] = [lessonA, lessonB]

/** IApiClient מינימלי עם store אמיתי (mutable) ל-userProgress בלבד. */
function fakeApi(): { api: IApiClient; store: UserProgress[] } {
  const store: UserProgress[] = []
  const empty = { findMany: async () => [] }
  const api = {
    userProgress: {
      findMany: async ({ filter }: { filter?: Partial<UserProgress> } = {}) =>
        filter
          ? store.filter((e) =>
              Object.entries(filter).every(
                ([k, v]) => e[k as keyof UserProgress] === v,
              ),
            )
          : [...store],
      create: async (data: Partial<UserProgress>) => {
        const record = {
          ...data,
          id: `evt${store.length}`,
          created_date: '',
          updated_date: '',
        } as UserProgress
        store.push(record)
        return record
      },
    },
    topics: { findMany: async () => topics },
    trackModules: { findMany: async () => trackModules },
    moduleLessons: { findMany: async () => lessons },
    users: empty,
    learningTracks: empty,
    sharedModules: empty,
    exams: empty,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any
  return { api, store }
}

describe('ensureLessonStarted', () => {
  it('יוצר lesson_started פעם אחת בלבד', async () => {
    const { api, store } = fakeApi()
    await ensureLessonStarted(api, USER_ID, lessonA, TRACK_ID)
    await ensureLessonStarted(api, USER_ID, lessonA, TRACK_ID)
    expect(
      store.filter((e) => e.progress_type === 'lesson_started'),
    ).toHaveLength(1)
  })

  it('לא יוצר lesson_started אם כבר יש lesson_completed לאותו שיעור', async () => {
    const { api, store } = fakeApi()
    store.push({
      id: 'e0',
      user_id: USER_ID,
      lesson_id: lessonA.id,
      progress_type: 'lesson_completed',
      created_date: '',
      updated_date: '',
    })
    await ensureLessonStarted(api, USER_ID, lessonA, TRACK_ID)
    expect(
      store.filter((e) => e.progress_type === 'lesson_started'),
    ).toHaveLength(0)
  })
})

describe('completeLesson', () => {
  it('לא יוצר lesson_completed כפול בביקור חוזר בשיעור שכבר הושלם', async () => {
    const { api, store } = fakeApi()
    await completeLesson({
      api,
      userId: USER_ID,
      trackId: TRACK_ID,
      lesson: lessonA,
      timeSpentMinutes: 5,
    })
    await completeLesson({
      api,
      userId: USER_ID,
      trackId: TRACK_ID,
      lesson: lessonA,
      timeSpentMinutes: 2,
    })
    expect(
      store.filter(
        (e) => e.progress_type === 'lesson_completed' && e.lesson_id === lessonA.id,
      ),
    ).toHaveLength(1)
  })

  it('יוצר lesson_completed עם score=100 ו-completion_percentage=100', async () => {
    const { api, store } = fakeApi()
    await completeLesson({
      api,
      userId: USER_ID,
      trackId: TRACK_ID,
      lesson: lessonA,
      timeSpentMinutes: 5,
    })
    const event = store.find((e) => e.progress_type === 'lesson_completed')
    expect(event).toMatchObject({
      score: 100,
      completion_percentage: 100,
      lesson_id: lessonA.id,
      time_spent_minutes: 5,
    })
  })

  it('לא מסמן topic/track כהושלמו כל עוד שיעור אחד לא הושלם', async () => {
    const { api, store } = fakeApi()
    const outcome = await completeLesson({
      api,
      userId: USER_ID,
      trackId: TRACK_ID,
      lesson: lessonA,
      timeSpentMinutes: 5,
    })
    expect(outcome).toEqual({ topicCompleted: false, trackCompleted: false })
    expect(store.some((e) => e.progress_type === 'topic_completed')).toBe(false)
    expect(store.some((e) => e.progress_type === 'track_completed')).toBe(false)
  })

  it('מסמן topic_completed ו-track_completed כששני השיעורים הושלמו', async () => {
    const { api, store } = fakeApi()
    await completeLesson({
      api,
      userId: USER_ID,
      trackId: TRACK_ID,
      lesson: lessonA,
      timeSpentMinutes: 5,
    })
    const outcome = await completeLesson({
      api,
      userId: USER_ID,
      trackId: TRACK_ID,
      lesson: lessonB,
      timeSpentMinutes: 3,
    })
    expect(outcome).toEqual({ topicCompleted: true, trackCompleted: true })
    expect(
      store.filter((e) => e.progress_type === 'topic_completed'),
    ).toHaveLength(1)
    expect(
      store.filter((e) => e.progress_type === 'track_completed'),
    ).toHaveLength(1)
  })

  it('לא יוצר topic_completed/track_completed כפול אם כבר נורו קודם', async () => {
    const { api, store } = fakeApi()
    store.push({
      id: 'pre-topic',
      user_id: USER_ID,
      topic_id: 'top1',
      track_id: TRACK_ID,
      progress_type: 'topic_completed',
      created_date: '',
      updated_date: '',
    })
    store.push({
      id: 'pre-track',
      user_id: USER_ID,
      track_id: TRACK_ID,
      progress_type: 'track_completed',
      created_date: '',
      updated_date: '',
    })
    await completeLesson({
      api,
      userId: USER_ID,
      trackId: TRACK_ID,
      lesson: lessonA,
      timeSpentMinutes: 5,
    })
    await completeLesson({
      api,
      userId: USER_ID,
      trackId: TRACK_ID,
      lesson: lessonB,
      timeSpentMinutes: 3,
    })
    expect(
      store.filter((e) => e.progress_type === 'topic_completed'),
    ).toHaveLength(1)
    expect(
      store.filter((e) => e.progress_type === 'track_completed'),
    ).toHaveLength(1)
  })

  it('לעולם לא יוצר module_completed (החלטה מאושרת — לא נספר באף מדד)', async () => {
    const { api, store } = fakeApi()
    await completeLesson({
      api,
      userId: USER_ID,
      trackId: TRACK_ID,
      lesson: lessonA,
      timeSpentMinutes: 5,
    })
    await completeLesson({
      api,
      userId: USER_ID,
      trackId: TRACK_ID,
      lesson: lessonB,
      timeSpentMinutes: 3,
    })
    expect(store.some((e) => e.progress_type === 'module_completed')).toBe(
      false,
    )
  })
})
