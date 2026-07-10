/**
 * מנוע ההתקדמות — הפונקציה היחידה במערכת שמחשבת התקדמות.
 *
 * כללי הגזירה המלאים והכרעות המוצר: docs/PROGRESS_ENGINE.md (מאושר 2026-07-09).
 * progress_stats הוא ערך נגזר מאירועי UserProgress הגולמיים — לעולם לא מצב
 * שמור, לעולם לא increment. אף מסך/hook לא מחשב התקדמות לבד; כולם צורכים
 * את הפונקציה הזו (דרך useProgress).
 *
 * הפונקציה טהורה: (events, catalog, certificatesCount, now) → stats.
 * אין כאן Date.now(), אין קריאות רשת, אין מצב — אותו קלט ⇒ אותו פלט.
 */
import type {
  LearningTrack,
  ModuleLesson,
  Topic,
  TrackModule,
  User,
  UserProgress,
} from '@/types/entities'

// ── קבועי XP (PRD §5.2) ─────────────────────────────────────────────────────
export const XP_PER_LESSON = 10
export const XP_PER_EXAM = 25
export const XP_PER_CERTIFICATE = 50

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000

/**
 * החלטת 13.3-ב (PROGRESS_ENGINE.md, 2026-07-10): מדדי זמן נספרים רק מאירועים
 * מ-epoch זה והלאה. הזמן ההיסטורי של Base44 הוא artifact של מנגנון heartbeat
 * (85% מ-214 השעות ב-5 זוגות משתמש+שיעור; אנטי-מתואם עם למידה) — מוחרג במלואו.
 * עובדות הלמידה (השלמות, מבחנים, XP) נספרות מכל התקופות.
 */
export const TIME_TRACKING_EPOCH = '2026-07-10T00:00:00.000Z'
const TIME_TRACKING_EPOCH_MS = Date.parse(TIME_TRACKING_EPOCH)

/** ה-shape הנשמר — 1:1 מול SRS §1.1.1 והצורה שנצפתה בדאטה (PROGRESS_ENGINE.md §7) */
export interface ProgressStats {
  /** שיעורים ייחודיים שהושלמו (Set על lesson_id) */
  lessons_completed: number
  /** @deprecated alias היסטורי — תמיד === lessons_completed; UI חדש לא ישתמש בו */
  total_lessons: number
  /** המכנה של avg_progress; 0 כשאין מסלול רלוונטי למחלקה */
  total_lessons_in_track: number
  /** מסלולים ייחודיים שהושלמו (track_completed) */
  completed_courses: number
  /** מסלולים published הרלוונטיים למחלקת המשתמש */
  total_courses: number
  /** מבחנים ייחודיים שעברו (Set על exam_id) */
  exams_passed: number
  /** @deprecated alias היסטורי — תמיד === exams_passed */
  total_exams: number
  /** ממוצע מעוגל של score על אירועי exam_attempt בלבד; 0 כשאין */
  avg_score: number
  /** min(100, round(lessons_completed / total_lessons_in_track × 100)); 0 כשהמכנה 0 */
  avg_progress: number
  certificates_earned: number
  total_xp: number
  total_time_spent_minutes: number
  /** אירועי השלמת-שיעור בחלון 7 ימים מ-now */
  weekly_lessons: number
  weekly_time_spent_minutes: number
  /** max(effective_date) על כל האירועים — לא רגע החישוב; null בלי אירועים */
  last_activity: string | null
}

export interface ProgressInput {
  user: Pick<User, 'id' | 'department'>
  /** כל אירועי ה-UserProgress של המשתמש (append-only, כמות מלאה — בלי תקרת 1000) */
  events: UserProgress[]
  /** קטלוג הלמידה העדכני — המכנה נגזר ממנו בכל חישוב, לא מ-snapshot */
  catalog: {
    tracks: LearningTrack[]
    trackModules: TrackModule[]
    topics: Topic[]
    lessons: Pick<ModuleLesson, 'id' | 'topic_id' | 'status'>[]
  }
  /** count(UserCertificate) — מוזרק כקלט; המנוע לא ניגש לרשת */
  certificatesCount: number
  /** מוזרק לקביעת החלון השבועי — לעולם לא Date.now() בפנים */
  now: Date
}

export interface ProgressResult {
  stats: ProgressStats
  /** אירועים מסוג לא-מוכר שדולגו — counter אבחוני, לא חלק מה-stats הנשמר */
  ignoredEvents: number
}

/**
 * תאריך אפקטיבי של אירוע: completed_at קיים רק על אירועי השלמה/מבחן
 * (187 מ-5,000 בדאטה) — לכן fallback ל-created_date (PROGRESS_ENGINE.md §2).
 */
export function effectiveDate(e: UserProgress): string {
  return e.completed_at ?? e.created_date
}

/**
 * המכנה האמיתי: שיעורים published במסלולים published של מחלקת המשתמש,
 * דרך שרשרת track → TrackModule → Topic → ModuleLesson (PROGRESS_ENGINE.md §4).
 */
function countTrackLessons(
  catalog: ProgressInput['catalog'],
  department: string | null | undefined,
): { totalLessonsInTrack: number; totalCourses: number } {
  const relevantTrackIds = new Set(
    catalog.tracks
      .filter((t) => t.status === 'published' && t.category === department)
      .map((t) => t.id),
  )
  const moduleIds = new Set(
    catalog.trackModules
      .filter((tm) => relevantTrackIds.has(tm.track_id))
      .map((tm) => tm.shared_module_id),
  )
  const topicIds = new Set(
    catalog.topics
      .filter((t) => moduleIds.has(t.shared_module_id))
      .map((t) => t.id),
  )
  const totalLessonsInTrack = catalog.lessons.filter(
    (l) => topicIds.has(l.topic_id) && l.status === 'published',
  ).length
  return { totalLessonsInTrack, totalCourses: relevantTrackIds.size }
}

export function recalculateUserStats(input: ProgressInput): ProgressResult {
  const { events, catalog, certificatesCount, now, user } = input
  const weekAgoMs = now.getTime() - WEEK_IN_MS

  const uniqueLessons = new Set<string>()
  const uniqueWeeklyLessons = new Set<string>()
  const uniquePassedExams = new Set<string>()
  const uniqueCompletedTracks = new Set<string>()
  let totalScore = 0
  let scoreCount = 0
  let totalTime = 0
  let weeklyTime = 0
  let lastActivityMs = Number.NEGATIVE_INFINITY
  let lastActivity: string | null = null
  let ignoredEvents = 0

  for (const e of events) {
    const date = effectiveDate(e)
    const dateMs = Date.parse(date)
    const isWeekly = dateMs >= weekAgoMs
    if (dateMs > lastActivityMs) {
      lastActivityMs = dateMs
      lastActivity = date
    }

    // זמן נצבר רק מאירועי העידן-הנקי (החלטת 13.3-ב) — legacy heartbeat מוחרג
    if (
      typeof e.time_spent_minutes === 'number' &&
      dateMs >= TIME_TRACKING_EPOCH_MS
    ) {
      totalTime += e.time_spent_minutes
      if (isWeekly) weeklyTime += e.time_spent_minutes
    }

    switch (e.progress_type) {
      case 'lesson_completed':
        if (e.lesson_id) {
          uniqueLessons.add(e.lesson_id)
          if (isWeekly) uniqueWeeklyLessons.add(e.lesson_id)
        }
        break
      case 'exam_passed':
        if (e.exam_id) uniquePassedExams.add(e.exam_id)
        break
      case 'exam_attempt':
        // רק exam_attempt נספר בציון — lesson_completed נושא תמיד score=100
        if (typeof e.score === 'number') {
          totalScore += e.score
          scoreCount++
        }
        break
      case 'track_completed':
        if (e.track_id) uniqueCompletedTracks.add(e.track_id)
        break
      // מוכרים אך לא נספרים באף מדד:
      // lesson_quiz_attempt — legacy מהדאטה (הכרעה 8-ג); started/topic/module — הקשר בלבד
      case 'lesson_started':
      case 'topic_completed':
      case 'module_completed':
      case 'lesson_quiz_attempt':
        break
      default:
        ignoredEvents++
    }
  }

  const { totalLessonsInTrack, totalCourses } = countTrackLessons(
    catalog,
    user.department,
  )

  const lessonsCompleted = uniqueLessons.size
  const examsPassed = uniquePassedExams.size

  // מכנה 0 ⇒ 0%, לא ה-fallback של Base44 שהציג 100% פיקטיבי (הכרעה 8-ב)
  const avgProgress =
    totalLessonsInTrack > 0
      ? Math.min(
          100,
          Math.round((lessonsCompleted / totalLessonsInTrack) * 100),
        )
      : 0

  return {
    stats: {
      lessons_completed: lessonsCompleted,
      total_lessons: lessonsCompleted,
      total_lessons_in_track: totalLessonsInTrack,
      completed_courses: uniqueCompletedTracks.size,
      total_courses: totalCourses,
      exams_passed: examsPassed,
      total_exams: examsPassed,
      avg_score: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
      avg_progress: avgProgress,
      certificates_earned: certificatesCount,
      // גזירה טהורה — בלי ה-ratchet max(current_xp) של Base44 (הכרעה 8-א)
      total_xp:
        lessonsCompleted * XP_PER_LESSON +
        examsPassed * XP_PER_EXAM +
        certificatesCount * XP_PER_CERTIFICATE,
      total_time_spent_minutes: totalTime,
      weekly_lessons: uniqueWeeklyLessons.size,
      weekly_time_spent_minutes: weeklyTime,
      last_activity: lastActivity,
    },
    ignoredEvents,
  }
}
