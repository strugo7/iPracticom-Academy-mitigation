/**
 * מדדי-התצוגה שמעל המנוע (PROGRESS_ENGINE.md §10) — נגזרים טהורים לצורכי UI:
 * המונה/מכנה של "מבחנים שעברת X/Y", רמת XP, ופירוק פעילות יומי (א׳–ש׳).
 *
 * שכבה נפרדת בכוונה: recalculateUserStats נשאר חוזה ה-stats הנשמר (SRS §1.1.1)
 * ולא משתנה. גם כאן — פונקציה טהורה: אותו קלט ⇒ אותו פלט, בלי רשת ובלי Date.now().
 */
import type { Exam } from '@/types/entities'
import {
  effectiveDate,
  TIME_TRACKING_EPOCH,
  type ProgressInput,
  type ProgressStats,
} from './progressService'

const TIME_TRACKING_EPOCH_MS = Date.parse(TIME_TRACKING_EPOCH)

/**
 * מדרגת ה-XP לרמה. אין נוסחה ב-PRD/SRS או בדאטה (current_level קיים על משתמש
 * יחיד) — הקבוע נגזר מהמוקאפ המאושר: 1,240 XP ⇒ רמה 4, עוד 160 ל-1,400.
 */
export const XP_PER_LEVEL = 350

const DAYS_IN_WINDOW = 7
const DAY_IN_MS = 24 * 60 * 60 * 1000

export interface DailyActivity {
  /** יום קלנדרי בירושלים (YYYY-MM-DD) — התצוגה והמשתמשים חיים ב-Asia/Jerusalem */
  date: string
  /** שיעורים ייחודיים שהושלמו באותו יום */
  lessons: number
  /** דקות למידה שנצברו באותו יום */
  minutes: number
}

export interface ProgressInsights {
  /** מבחני published המעוגנים בתוכן המסלול של המשתמש (בלי מבחני כניסה) */
  total_exams_in_track: number
  /** מבחני-מסלול ייחודיים שעברו — המונה של "מבחנים שעברת X/Y" */
  exams_passed_in_track: number
  level: number
  xp_to_next_level: number
  /** 7 ימים קלנדריים, מהישן לחדש; ימים בלי פעילות מאופסים */
  daily_activity: DailyActivity[]
}

/** קלט המנוע + מבחני הקטלוג (השדות הדרושים לקביעת שייכות-למסלול בלבד) */
export interface InsightsInput extends ProgressInput {
  catalog: ProgressInput['catalog'] & {
    exams: Pick<
      Exam,
      'id' | 'context_type' | 'context_id' | 'status' | 'is_entrance_exam'
    >[]
  }
}

// פורמט קבוע ל-YYYY-MM-DD בירושלים (en-CA נותן ISO-order); נבנה פעם אחת
const jerusalemDayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jerusalem',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const jerusalemDay = (isoDate: string | Date): string =>
  jerusalemDayFormat.format(
    typeof isoDate === 'string' ? new Date(isoDate) : isoDate,
  )

/** רצף 7 הימים הקלנדריים שמסתיים ביום-בירושלים של now — חשבון לוח טהור, בלי DST */
function windowDays(now: Date): string[] {
  const [y, m, d] = jerusalemDay(now).split('-').map(Number)
  const anchor = Date.UTC(y, m - 1, d)
  return Array.from({ length: DAYS_IN_WINDOW }, (_, i) => {
    const day = new Date(anchor - (DAYS_IN_WINDOW - 1 - i) * DAY_IN_MS)
    return day.toISOString().slice(0, 10)
  })
}

/**
 * תוכן המסלול של מחלקה: מסלולי published של המחלקה → מודולים → נושאים →
 * שיעורי published. אותה שרשרת של מכנה-השיעורים במנוע (PROGRESS_ENGINE.md §4).
 */
function collectTrackContent(
  catalog: InsightsInput['catalog'],
  department: string | null | undefined,
): { topicIds: Set<string>; lessonIds: Set<string> } {
  const trackIds = new Set(
    catalog.tracks
      .filter((t) => t.status === 'published' && t.category === department)
      .map((t) => t.id),
  )
  const moduleIds = new Set(
    catalog.trackModules
      .filter((tm) => trackIds.has(tm.track_id))
      .map((tm) => tm.shared_module_id),
  )
  const topicIds = new Set(
    catalog.topics
      .filter((t) => moduleIds.has(t.shared_module_id))
      .map((t) => t.id),
  )
  const lessonIds = new Set(
    catalog.lessons
      // l.topic_id יכול להיות null (9 שיעורים יתומים בגיבוי — ראו entities.ts);
      // כאלה לעולם לא נמצאים ב-topicIds ומסוננים ממילא, השומר רק מספק ל-TS.
      .filter(
        (l) =>
          l.topic_id != null &&
          topicIds.has(l.topic_id) &&
          l.status === 'published',
      )
      .map((l) => l.id),
  )
  return { topicIds, lessonIds }
}

export function deriveProgressInsights(
  input: InsightsInput,
  stats: Pick<ProgressStats, 'total_xp'>,
): ProgressInsights {
  const { events, catalog, now, user } = input

  // ── מבחנים במסלול ──────────────────────────────────────────────────────
  const { topicIds, lessonIds } = collectTrackContent(catalog, user.department)
  const trackExamIds = new Set(
    catalog.exams
      .filter(
        (e) =>
          e.status === 'published' &&
          !e.is_entrance_exam &&
          e.context_id != null &&
          ((e.context_type === 'lesson' && lessonIds.has(e.context_id)) ||
            (e.context_type === 'topic' && topicIds.has(e.context_id))),
      )
      .map((e) => e.id),
  )
  const passedInTrack = new Set<string>()

  // ── פעילות יומית ───────────────────────────────────────────────────────
  const days = windowDays(now)
  const lessonsByDay = new Map<string, Set<string>>(
    days.map((d) => [d, new Set()]),
  )
  const minutesByDay = new Map<string, number>(days.map((d) => [d, 0]))

  for (const e of events) {
    if (
      e.progress_type === 'exam_passed' &&
      e.exam_id &&
      trackExamIds.has(e.exam_id)
    ) {
      passedInTrack.add(e.exam_id)
    }

    const date = effectiveDate(e)
    const day = jerusalemDay(date)
    if (!minutesByDay.has(day)) continue // מחוץ לחלון 7 הימים
    // דקות רק מהעידן-הנקי (החלטת 13.3-ב); שיעורים — מכל התקופות
    if (
      typeof e.time_spent_minutes === 'number' &&
      Date.parse(date) >= TIME_TRACKING_EPOCH_MS
    ) {
      minutesByDay.set(day, (minutesByDay.get(day) ?? 0) + e.time_spent_minutes)
    }
    if (e.progress_type === 'lesson_completed' && e.lesson_id) {
      lessonsByDay.get(day)?.add(e.lesson_id)
    }
  }

  // ── רמת XP ─────────────────────────────────────────────────────────────
  const level = Math.floor(stats.total_xp / XP_PER_LEVEL) + 1
  const xpToNext = XP_PER_LEVEL - (stats.total_xp % XP_PER_LEVEL)

  return {
    total_exams_in_track: trackExamIds.size,
    exams_passed_in_track: passedInTrack.size,
    level,
    xp_to_next_level: xpToNext,
    daily_activity: days.map((date) => ({
      date,
      lessons: lessonsByDay.get(date)?.size ?? 0,
      minutes: minutesByDay.get(date) ?? 0,
    })),
  }
}
