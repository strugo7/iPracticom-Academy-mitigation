/**
 * פיד פעילות אחרונה לדשבורד האישי (SRS §2.3 getActivityFeed).
 * נגזר ישירות מאירועי ה-UserProgress של המשתמש — בלי ישות/hook נפרדים.
 * תעודות אינן מיוצגות: UserCertificate לא קיים ב-19 ישויות הגיבוי (ראו
 * useProgress.ts) ולכן אין אירוע מקור לזיהוי "קיבלת תעודה" — יתווסף בשלב התעודות.
 */
import type {
  Exam,
  LearningTrack,
  ModuleLesson,
  UserProgress,
} from '@/types/entities'
import { effectiveDate } from './progressService'

const DEFAULT_LIMIT = 5

export type ActivityFeedItemType =
  | 'lesson_completed'
  | 'exam_passed'
  | 'track_completed'

export interface ActivityFeedItem {
  id: string
  type: ActivityFeedItemType
  label: string
  date: string
}

export interface ActivityFeedCatalog {
  lessons: Pick<ModuleLesson, 'id' | 'title'>[]
  exams: Pick<Exam, 'id' | 'title'>[]
  tracks: Pick<LearningTrack, 'id' | 'title'>[]
}

const FEED_TYPES: ReadonlySet<UserProgress['progress_type']> = new Set([
  'lesson_completed',
  'exam_passed',
  'track_completed',
])

function labelFor(
  event: UserProgress,
  catalog: ActivityFeedCatalog,
): { type: ActivityFeedItemType; label: string } | null {
  switch (event.progress_type) {
    case 'lesson_completed': {
      const title = catalog.lessons.find((l) => l.id === event.lesson_id)
        ?.title
      return { type: 'lesson_completed', label: `השלמת את השיעור "${title ?? 'שיעור'}"` }
    }
    case 'exam_passed': {
      const title = catalog.exams.find((e) => e.id === event.exam_id)?.title
      return { type: 'exam_passed', label: `עברת את המבחן "${title ?? 'מבחן'}"` }
    }
    case 'track_completed': {
      const title = catalog.tracks.find((t) => t.id === event.track_id)?.title
      return {
        type: 'track_completed',
        label: `השלמת את המסלול "${title ?? 'מסלול'}"`,
      }
    }
    default:
      return null
  }
}

/** האירועים האחרונים (החדש ביותר קודם), ממופים לתווית עברית קריאה */
export function deriveActivityFeed(
  events: UserProgress[],
  catalog: ActivityFeedCatalog,
  limit: number = DEFAULT_LIMIT,
): ActivityFeedItem[] {
  return events
    .filter((e) => FEED_TYPES.has(e.progress_type))
    .sort(
      (a, b) => Date.parse(effectiveDate(b)) - Date.parse(effectiveDate(a)),
    )
    .slice(0, limit)
    .flatMap((e) => {
      const info = labelFor(e, catalog)
      if (!info) return []
      return [{ id: e.id, ...info, date: effectiveDate(e) }]
    })
}
