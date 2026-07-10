import { describe, expect, it } from 'vitest'
import type {
  LearningTrack,
  ModuleLesson,
  SharedModule,
  Topic,
  TrackModule,
  UserProgress,
} from '@/types/entities'
import {
  assembleTrackDetails,
  type TrackDetailsCatalog,
} from './trackDetailsService'

const TRACK_ID = 'track-1'
const track: LearningTrack = {
  id: TRACK_ID,
  title: 'הכשרת בדיקה',
  created_date: '2026-01-01T00:00:00.000Z',
  updated_date: '2026-01-01T00:00:00.000Z',
}

const moduleA: SharedModule = {
  id: 'mod-a',
  title: 'מודול א',
  created_date: '2026-01-01T00:00:00.000Z',
  updated_date: '2026-01-01T00:00:00.000Z',
}
const moduleB: SharedModule = {
  id: 'mod-b',
  title: 'מודול ב',
  created_date: '2026-01-01T00:00:00.000Z',
  updated_date: '2026-01-01T00:00:00.000Z',
}
// רשומה חריגה כמו בגיבוי האמיתי — בלי shared_module_id (אופציונלי בטיפוס,
// ראו Task 1), חייבת להיות מסוננת בשקט
const malformedTrackModule: TrackModule = {
  id: 'tm-malformed',
  track_id: TRACK_ID,
  order_index: 99,
  created_date: '2026-01-01T00:00:00.000Z',
  updated_date: '2026-01-01T00:00:00.000Z',
}
const trackModules: TrackModule[] = [
  {
    id: 'tm-a',
    track_id: TRACK_ID,
    shared_module_id: 'mod-a',
    order_index: 0,
    created_date: '',
    updated_date: '',
  },
  {
    id: 'tm-b',
    track_id: TRACK_ID,
    shared_module_id: 'mod-b',
    order_index: 1,
    created_date: '',
    updated_date: '',
  },
  malformedTrackModule,
]

const topic1: Topic = {
  id: 't1',
  shared_module_id: 'mod-a',
  title: 'נושא 1',
  order_index: 0,
  created_date: '',
  updated_date: '',
}
const topic2: Topic = {
  id: 't2',
  shared_module_id: 'mod-b',
  title: 'נושא 2',
  order_index: 0,
  created_date: '',
  updated_date: '',
}

const lessons: ModuleLesson[] = [
  {
    id: 'l1',
    topic_id: 't1',
    title: 'שיעור 1',
    order_index: 0,
    require_previous_lesson: false,
    status: 'published',
    xp_reward: 10,
    created_date: '',
    updated_date: '',
  },
  {
    id: 'l2',
    topic_id: 't1',
    title: 'שיעור 2',
    order_index: 1,
    require_previous_lesson: true,
    status: 'published',
    created_date: '',
    updated_date: '',
  },
  {
    id: 'l3',
    topic_id: 't1',
    title: 'שיעור 3',
    order_index: 2,
    require_previous_lesson: true,
    status: 'published',
    created_date: '',
    updated_date: '',
  },
  {
    id: 'l4',
    topic_id: 't2',
    title: 'שיעור 4',
    order_index: 0,
    require_previous_lesson: true,
    status: 'published',
    created_date: '',
    updated_date: '',
  },
  {
    id: 'l-draft',
    topic_id: 't2',
    title: 'שיעור טיוטה',
    order_index: 1,
    status: 'draft',
    created_date: '',
    updated_date: '',
  },
]

const catalog: TrackDetailsCatalog = {
  trackModules,
  sharedModules: [moduleA, moduleB],
  topics: [topic2, topic1], // בכוונה לא-ממוין — הפונקציה חייבת למיין לבד
  lessons,
  exams: [
    {
      id: 'e1',
      title: 'מבחן נושא 2',
      context_type: 'topic',
      context_id: 't2',
      status: 'published',
      is_entrance_exam: false,
    },
    {
      id: 'e2',
      title: 'מבחן כניסה',
      context_type: 'topic',
      context_id: 't2',
      status: 'published',
      is_entrance_exam: true,
    },
    {
      id: 'e3',
      title: 'מבחן שיעור',
      context_type: 'lesson',
      context_id: 'l1',
      status: 'published',
      is_entrance_exam: false,
    },
  ],
}

const events: UserProgress[] = [
  {
    id: 'ev1',
    user_id: 'u1',
    progress_type: 'lesson_completed',
    lesson_id: 'l1',
    created_date: '2026-02-01T00:00:00.000Z',
    updated_date: '',
  },
  {
    id: 'ev2',
    user_id: 'u1',
    progress_type: 'lesson_started',
    lesson_id: 'l2',
    completion_percentage: 40,
    created_date: '2026-02-02T00:00:00.000Z',
    updated_date: '',
  },
]

describe('assembleTrackDetails', () => {
  const result = assembleTrackDetails(track, catalog, events)

  it('מסנן את ה-TrackModule החריג בשקט — 2 מודולים בלבד, בסדר order_index', () => {
    expect(result.modules).toHaveLength(2)
    expect(result.modules.map((m) => m.module.id)).toEqual(['mod-a', 'mod-b'])
  })

  it('שיעור 1: completed', () => {
    const l1 = result.modules[0].topics[0].lessons[0]
    expect(l1.status).toBe('completed')
  })

  it('שיעור 2: in_progress עם האחוז מהאירוע', () => {
    const l2 = result.modules[0].topics[0].lessons[1]
    expect(l2.status).toBe('in_progress')
    expect(l2.percent).toBe(40)
  })

  it('שיעור 3: locked — הקודם (שיעור 2) לא הושלם', () => {
    const l3 = result.modules[0].topics[0].lessons[2]
    expect(l3.status).toBe('locked')
  })

  it('שיעור 4: locked גם כשהוא חוצה גבול-מודול (הקודם track-wide הוא שיעור 3, לא הושלם)', () => {
    const l4 = result.modules[1].topics[0].lessons[0]
    expect(l4.status).toBe('locked')
  })

  it('שיעור בטיוטה לא מופיע בכלל', () => {
    const topic2Lessons = result.modules[1].topics[0].lessons
    expect(topic2Lessons).toHaveLength(1)
    expect(topic2Lessons.find((l) => l.lesson.id === 'l-draft')).toBeUndefined()
  })

  it('מבחן-נושא מצורף רק כש-topic + published + לא-מבחן-כניסה', () => {
    expect(result.modules[1].topics[0].exam?.id).toBe('e1')
    expect(result.modules[0].topics[0].exam).toBeUndefined()
  })

  it('מודול א הוא isCurrent (הלא-שלם הראשון); מודול ב לא', () => {
    expect(result.modules[0].isCurrent).toBe(true)
    expect(result.modules[1].isCurrent).toBe(false)
  })

  it('צבירה: 1/4 שיעורים הושלמו (l-draft לא נספר), 25%, 10 XP', () => {
    expect(result.lessonsDone).toBe(1)
    expect(result.lessonsTotal).toBe(4)
    expect(result.percent).toBe(25)
    expect(result.totalXp).toBe(10)
  })

  it('resumeLessonId מצביע על השיעור הראשון ב-in_progress', () => {
    expect(result.resumeLessonId).toBe('l2')
  })

  it('כשאין in_progress בכלל — resumeLessonId הוא ה-not_started הראשון', () => {
    const onlyCompleted = events.filter(
      (e) => e.progress_type === 'lesson_completed',
    )
    const r = assembleTrackDetails(track, catalog, onlyCompleted)
    // l2 הוא not_started (לא locked, כי l1 הושלם); l3/l4 locked
    expect(r.resumeLessonId).toBe('l2')
  })
})
