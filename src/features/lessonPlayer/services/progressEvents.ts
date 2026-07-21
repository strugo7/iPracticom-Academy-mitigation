/**
 * הכותב הראשון ל-UserProgress (PROGRESS_ENGINE.md, §13.2). שתי חוקים מרכזיים:
 * 1) lesson_started נכתב פעם אחת בלבד פר-(user,lesson) — מונע חזרה על bug
 *    ה-heartbeat ההיסטורי (4,813 אירועי lesson_started מיותרים בדאטה הישן).
 * 2) module_completed **לא** נכתב — לא נספר באף מדד היום, אין צרכן (החלטה מאושרת).
 * topic_completed/track_completed נכתבים רק כש-*כל* השיעורים המפורסמים
 * בהיקף הרלוונטי הושלמו, ורק פעם אחת (dedup מול אירועים קיימים).
 */
import type { IApiClient } from '@/lib/api'
import type { ModuleLesson } from '@/types/entities'

export async function ensureLessonStarted(
  api: IApiClient,
  userId: string,
  lesson: ModuleLesson,
  trackId: string,
): Promise<void> {
  const events = await api.userProgress.findMany({
    filter: { user_id: userId, lesson_id: lesson.id },
  })
  const alreadyTracked = events.some(
    (e) =>
      e.progress_type === 'lesson_started' ||
      e.progress_type === 'lesson_completed',
  )
  if (alreadyTracked) return

  await api.userProgress.create({
    user_id: userId,
    lesson_id: lesson.id,
    topic_id: lesson.topic_id ?? null,
    track_id: trackId,
    progress_type: 'lesson_started',
    completion_percentage: 0,
  })
}

export interface CompleteLessonInput {
  api: IApiClient
  userId: string
  trackId: string
  lesson: ModuleLesson
  timeSpentMinutes: number
}

export interface CompleteLessonOutcome {
  topicCompleted: boolean
  trackCompleted: boolean
}

export async function completeLesson({
  api,
  userId,
  trackId,
  lesson,
  timeSpentMinutes,
}: CompleteLessonInput): Promise<CompleteLessonOutcome> {
  const existingLessonEvents = await api.userProgress.findMany({
    filter: { user_id: userId, lesson_id: lesson.id },
  })
  const alreadyCompleted = existingLessonEvents.some(
    (e) => e.progress_type === 'lesson_completed',
  )
  // חוזרים לשיעור שכבר הושלם (למשל סקירה חוזרת) — לא כותבים lesson_completed
  // כפול; recalculateUserStats מדדופל לפי lesson_id ממילא, אבל עדיף לא לכתוב
  // רשומות מיותרות מלכתחילה (אותו עיקרון כמו ensureLessonStarted).
  if (!alreadyCompleted) {
    await api.userProgress.create({
      user_id: userId,
      lesson_id: lesson.id,
      topic_id: lesson.topic_id ?? null,
      track_id: trackId,
      progress_type: 'lesson_completed',
      completion_percentage: 100,
      // lesson_completed נושא תמיד score=100 (progressService.ts) — לא ציון-מבחן.
      score: 100,
      completed_at: new Date().toISOString(),
      time_spent_minutes: timeSpentMinutes,
    })
  }

  const [events, topics, trackModules, lessons] = await Promise.all([
    api.userProgress.findMany({ filter: { user_id: userId } }),
    api.topics.findMany(),
    api.trackModules.findMany({ filter: { track_id: trackId } }),
    api.moduleLessons.findMany(),
  ])

  const completedLessonIds = new Set(
    events
      .filter((e) => e.progress_type === 'lesson_completed' && e.lesson_id)
      .map((e) => e.lesson_id as string),
  )
  completedLessonIds.add(lesson.id)

  const topic = lesson.topic_id
    ? topics.find((t) => t.id === lesson.topic_id)
    : undefined
  let topicCompleted = false
  if (topic) {
    const topicLessons = lessons.filter(
      (l) => l.topic_id === topic.id && l.status === 'published',
    )
    topicCompleted =
      topicLessons.length > 0 &&
      topicLessons.every((l) => completedLessonIds.has(l.id))
    const alreadyFired = events.some(
      (e) => e.progress_type === 'topic_completed' && e.topic_id === topic.id,
    )
    if (topicCompleted && !alreadyFired) {
      await api.userProgress.create({
        user_id: userId,
        topic_id: topic.id,
        track_id: trackId,
        progress_type: 'topic_completed',
      })
    }
  }

  const trackSharedModuleIds = new Set(
    trackModules.map((tm) => tm.shared_module_id).filter((id): id is string => Boolean(id)),
  )
  const trackTopicIds = new Set(
    topics.filter((t) => trackSharedModuleIds.has(t.shared_module_id)).map((t) => t.id),
  )
  const trackLessons = lessons.filter(
    (l) => l.topic_id && trackTopicIds.has(l.topic_id) && l.status === 'published',
  )
  const trackCompleted =
    trackLessons.length > 0 &&
    trackLessons.every((l) => completedLessonIds.has(l.id))
  const trackAlreadyFired = events.some(
    (e) => e.progress_type === 'track_completed' && e.track_id === trackId,
  )
  if (trackCompleted && !trackAlreadyFired) {
    await api.userProgress.create({
      user_id: userId,
      track_id: trackId,
      progress_type: 'track_completed',
    })
  }

  return { topicCompleted, trackCompleted }
}
