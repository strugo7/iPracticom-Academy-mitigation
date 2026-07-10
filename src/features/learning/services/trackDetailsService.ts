/**
 * הרכבת עץ תוכן ההכשרה (TrackDetails, doc 04) — מודול → נושא → שיעור, עם סטטוס
 * לכל שיעור ונעילת-רצף. פונקציה טהורה מעל הקטלוג + אירועי UserProgress הגולמיים;
 * לא מחשבת שום דבר שכבר מחושב ב-progressService/progressInsights (Phase 1).
 *
 * כללי הגזירה: docs/superpowers/specs/2026-07-10-learning-catalog-track-details-design.md
 */
import { effectiveDate, XP_PER_LESSON } from '@/lib/services/progressService'
import type {
  Exam,
  LearningTrack,
  ModuleLesson,
  SharedModule,
  Topic,
  TrackModule,
  UserProgress,
} from '@/types/entities'
import type {
  LessonStatus,
  LessonViewModel,
  ModuleViewModel,
  TopicViewModel,
  TrackDetailsViewModel,
} from '../types'

export interface TrackDetailsCatalog {
  trackModules: TrackModule[]
  sharedModules: SharedModule[]
  topics: Topic[]
  lessons: ModuleLesson[]
  exams: Pick<
    Exam,
    | 'id'
    | 'title'
    | 'context_type'
    | 'context_id'
    | 'status'
    | 'is_entrance_exam'
  >[]
}

function byOrderIndex<T extends { order_index?: number | null }>(
  a: T,
  b: T,
): number {
  return (
    (a.order_index ?? Number.MAX_SAFE_INTEGER) -
    (b.order_index ?? Number.MAX_SAFE_INTEGER)
  )
}

/** אירוע ה-lesson_started האחרון פר-שיעור — קובע את אחוז ה"בתהליך" ואת נקודת ה-resume */
function latestStartedByLesson(
  events: UserProgress[],
): Map<string, UserProgress> {
  const byLesson = new Map<string, UserProgress>()
  const effectiveMs = (e: UserProgress) => Date.parse(effectiveDate(e))
  for (const e of events) {
    if (e.progress_type !== 'lesson_started' || !e.lesson_id) continue
    const current = byLesson.get(e.lesson_id)
    if (!current || effectiveMs(e) > effectiveMs(current)) {
      byLesson.set(e.lesson_id, e)
    }
  }
  return byLesson
}

export function assembleTrackDetails(
  track: LearningTrack,
  catalog: TrackDetailsCatalog,
  events: UserProgress[],
): TrackDetailsViewModel {
  const completedLessonIds = new Set(
    events
      .filter((e) => e.progress_type === 'lesson_completed' && e.lesson_id)
      .map((e) => e.lesson_id as string),
  )
  const startedByLesson = latestStartedByLesson(events)

  const sharedModuleById = new Map(catalog.sharedModules.map((m) => [m.id, m]))
  const topicsByModuleId = new Map<string, Topic[]>()
  for (const topic of catalog.topics) {
    const list = topicsByModuleId.get(topic.shared_module_id)
    if (list) list.push(topic)
    else topicsByModuleId.set(topic.shared_module_id, [topic])
  }
  const lessonsByTopicId = new Map<string, ModuleLesson[]>()
  for (const lesson of catalog.lessons) {
    if (lesson.status !== 'published' || !lesson.topic_id) continue
    const list = lessonsByTopicId.get(lesson.topic_id)
    if (list) list.push(lesson)
    else lessonsByTopicId.set(lesson.topic_id, [lesson])
  }

  // מודולים של המסלול, בסדר track-wide — רשומות בלי shared_module_id תקין
  // (או שלא נמצאות ב-sharedModules) מסוננות: אנומליית-נתונים מתועדת ב-entities.ts.
  const orderedModules = catalog.trackModules
    .filter((tm) => tm.track_id === track.id)
    .filter(
      (tm): tm is TrackModule & { shared_module_id: string } =>
        !!tm.shared_module_id && sharedModuleById.has(tm.shared_module_id),
    )
    .sort(byOrderIndex)

  // שטיחת השיעורים בסדר track-wide (מודול → נושא → שיעור) — הבסיס לנעילת-הרצף
  interface FlatLesson {
    lesson: ModuleLesson
  }
  const flat: FlatLesson[] = []
  const topicsPerModule: Topic[][] = []
  for (const tm of orderedModules) {
    const topics = (topicsByModuleId.get(tm.shared_module_id) ?? [])
      .slice()
      .sort(byOrderIndex)
    topicsPerModule.push(topics)
    for (const topic of topics) {
      const lessons = (lessonsByTopicId.get(topic.id) ?? [])
        .slice()
        .sort(byOrderIndex)
      for (const lesson of lessons) {
        flat.push({ lesson })
      }
    }
  }

  // סטטוס + נעילת-רצף — מעבר יחיד על הרצף השטוח (doc 04: "היה הקודם הושלם?")
  const statusByLessonId = new Map<string, LessonStatus>()
  const percentByLessonId = new Map<string, number>()
  let previousCompleted = true
  for (const { lesson } of flat) {
    let status: LessonStatus
    if (completedLessonIds.has(lesson.id)) {
      status = 'completed'
    } else {
      const started = startedByLesson.get(lesson.id)
      if (started) {
        status = 'in_progress'
        percentByLessonId.set(lesson.id, started.completion_percentage ?? 0)
      } else if (lesson.require_previous_lesson && !previousCompleted) {
        status = 'locked'
      } else {
        status = 'not_started'
      }
    }
    statusByLessonId.set(lesson.id, status)
    previousCompleted = status === 'completed'
  }

  // הרכבת עץ ה-view-model (מודול → נושא → שיעור) מהמפות שחושבו למעלה
  let trackLessonsDone = 0
  let trackLessonsTotal = 0
  const modules: ModuleViewModel[] = orderedModules.map((tm, moduleIndex) => {
    const sharedModule = sharedModuleById.get(
      tm.shared_module_id,
    ) as SharedModule
    const topics: TopicViewModel[] = topicsPerModule[moduleIndex].map(
      (topic) => {
        const lessons: LessonViewModel[] = (
          lessonsByTopicId.get(topic.id) ?? []
        )
          .slice()
          .sort(byOrderIndex)
          .map((lesson) => ({
            lesson,
            status: statusByLessonId.get(lesson.id) ?? 'not_started',
            percent: percentByLessonId.get(lesson.id),
          }))
        const exam = catalog.exams.find(
          (e) =>
            e.context_type === 'topic' &&
            e.context_id === topic.id &&
            e.status === 'published' &&
            !e.is_entrance_exam,
        )
        return { topic, lessons, exam }
      },
    )

    const moduleLessons = topics.flatMap((t) => t.lessons)
    const lessonsDone = moduleLessons.filter(
      (l) => l.status === 'completed',
    ).length
    const lessonsTotal = moduleLessons.length
    trackLessonsDone += lessonsDone
    trackLessonsTotal += lessonsTotal

    return {
      module: sharedModule,
      moduleNumber: moduleIndex + 1,
      topics,
      lessonsDone,
      lessonsTotal,
      isCurrent: false, // מוגדר מיד אחרי הלולאה — המודול הלא-שלם הראשון
    }
  })

  const firstIncomplete = modules.find((m) => m.lessonsDone < m.lessonsTotal)
  if (firstIncomplete) firstIncomplete.isCurrent = true

  const resumeLesson =
    flat.find((f) => statusByLessonId.get(f.lesson.id) === 'in_progress') ??
    flat.find((f) => statusByLessonId.get(f.lesson.id) === 'not_started')

  return {
    track,
    modules,
    lessonsDone: trackLessonsDone,
    lessonsTotal: trackLessonsTotal,
    percent:
      trackLessonsTotal > 0
        ? Math.min(
            100,
            Math.round((trackLessonsDone / trackLessonsTotal) * 100),
          )
        : 0,
    totalXp: trackLessonsDone * XP_PER_LESSON,
    resumeLessonId: resumeLesson?.lesson.id,
  }
}
