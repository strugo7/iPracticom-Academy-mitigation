/**
 * בדיקות מנוע ההתקדמות — מממשות את הכללים המאושרים ב-PROGRESS_ENGINE.md.
 * כל מקרה-קצה כאן נצפה בדאטה האמיתי (ראו §1-§3 במסמך): ספירה כפולה,
 * completed_at חסר על lesson_started, מכנה 0 למחלקה בלי מסלול, ועוד.
 */
import { describe, expect, it } from 'vitest'
import type {
  LearningTrack,
  ModuleLesson,
  Topic,
  TrackModule,
  UserProgress,
} from '@/types/entities'
import type { ProgressType } from '@/lib/constants/enums'
import {
  recalculateUserStats,
  TIME_TRACKING_EPOCH,
  XP_PER_CERTIFICATE,
  XP_PER_EXAM,
  XP_PER_LESSON,
  type ProgressInput,
} from './progressService'

// ── עזרי בנייה ──────────────────────────────────────────────────────────────
const NOW = new Date('2026-07-20T12:00:00.000Z')
const OLD_DATE = '2026-01-01T10:00:00.000Z' // legacy: לפני ה-epoch וגם מחוץ לחלון
const RECENT_DATE = '2026-07-18T10:00:00.000Z' // עידן-נקי, בתוך החלון השבועי
const CLEAN_OFF_WINDOW = '2026-07-11T10:00:00.000Z' // עידן-נקי, מחוץ לחלון השבועי
const DEPT = 'תמיכה טכנית'
const USER_ID = 'u1'

let seq = 0
const base = () => ({
  id: `id-${++seq}`,
  created_date: OLD_DATE,
  updated_date: OLD_DATE,
})

const event = (
  progress_type: ProgressType,
  over: Partial<UserProgress> = {},
): UserProgress => ({
  ...base(),
  user_id: USER_ID,
  progress_type,
  completed_at: null,
  ...over,
})

const track = (
  id: string,
  over: Partial<LearningTrack> = {},
): LearningTrack => ({
  ...base(),
  id,
  status: 'published',
  category: DEPT,
  ...over,
})

const trackModule = (
  track_id: string,
  shared_module_id: string,
): TrackModule => ({
  ...base(),
  track_id,
  shared_module_id,
})

const topic = (id: string, shared_module_id: string): Topic => ({
  ...base(),
  id,
  shared_module_id,
})

const lesson = (
  id: string,
  topic_id: string,
  over: Partial<ModuleLesson> = {},
): ModuleLesson => ({ ...base(), id, topic_id, status: 'published', ...over })

/** קטלוג ברירת-מחדל: מסלול אחד רלוונטי עם 4 שיעורים published (המכנה) */
const defaultCatalog = (): ProgressInput['catalog'] => ({
  tracks: [
    track('t1'),
    track('t-draft', { status: 'draft' }), // לא published — לא נספר
    track('t-other', { category: 'הנהלה' }), // מחלקה אחרת — לא נספר
  ],
  trackModules: [
    trackModule('t1', 'm1'),
    trackModule('t-draft', 'm-draft'),
    trackModule('t-other', 'm-other'),
  ],
  topics: [topic('p1', 'm1'), topic('p2', 'm1'), topic('p-other', 'm-other')],
  lessons: [
    lesson('L1', 'p1'),
    lesson('L2', 'p1'),
    lesson('L3', 'p2'),
    lesson('L4', 'p2'),
    lesson('L-draft', 'p1', { status: 'draft' }), // לא במכנה
    lesson('L-archived', 'p2', { status: 'archived' }), // לא במכנה
    lesson('L-other-track', 'p-other'), // מסלול לא רלוונטי — לא במכנה
  ],
})

const input = (
  events: UserProgress[],
  over: Partial<ProgressInput> = {},
): ProgressInput => ({
  user: { id: USER_ID, department: DEPT },
  events,
  catalog: defaultCatalog(),
  certificatesCount: 0,
  now: NOW,
  ...over,
})

// ── דה-דופליקציה — שורש הבעיה ב-Base44 (PROGRESS_ENGINE.md §1, §3) ─────────
describe('דה-דופליקציה', () => {
  it('אירועי lesson_completed כפולים לאותו שיעור נספרים פעם אחת (מקרה martin: 28 אירועים, 12 שיעורים)', () => {
    const { stats } = recalculateUserStats(
      input([
        event('lesson_completed', { lesson_id: 'L1' }),
        event('lesson_completed', { lesson_id: 'L1' }),
        event('lesson_completed', { lesson_id: 'L1' }),
        event('lesson_completed', { lesson_id: 'L2' }),
      ]),
    )
    expect(stats.lessons_completed).toBe(2)
  })

  it('lesson_completed בלי lesson_id לא נספר', () => {
    const { stats } = recalculateUserStats(
      input([event('lesson_completed', { lesson_id: null })]),
    )
    expect(stats.lessons_completed).toBe(0)
  })

  it('exam_passed כפול לאותו מבחן נספר פעם אחת', () => {
    const { stats } = recalculateUserStats(
      input([
        event('exam_passed', { exam_id: 'E1', score: 80 }),
        event('exam_passed', { exam_id: 'E1', score: 90 }),
        event('exam_passed', { exam_id: 'E2', score: 70 }),
      ]),
    )
    expect(stats.exams_passed).toBe(2)
  })

  it('track_completed כפול נספר פעם אחת ב-completed_courses', () => {
    const { stats } = recalculateUserStats(
      input([
        event('track_completed', { track_id: 't1' }),
        event('track_completed', { track_id: 't1' }),
      ]),
    )
    expect(stats.completed_courses).toBe(1)
  })
})

// ── ציון ממוצע (PROGRESS_ENGINE.md §3) ─────────────────────────────────────
describe('avg_score', () => {
  it('ממוצע מעוגל של exam_attempt בלבד', () => {
    const { stats } = recalculateUserStats(
      input([
        event('exam_attempt', { exam_id: 'E1', score: 70 }),
        event('exam_attempt', { exam_id: 'E1', score: 85 }),
      ]),
    )
    expect(stats.avg_score).toBe(78) // round(155/2)
  })

  it('score=100 של lesson_completed לא מנפח את הממוצע', () => {
    const { stats } = recalculateUserStats(
      input([
        event('exam_attempt', { exam_id: 'E1', score: 60 }),
        event('lesson_completed', { lesson_id: 'L1', score: 100 }),
        event('exam_passed', { exam_id: 'E1', score: 100 }),
        event('lesson_quiz_attempt', { lesson_id: 'L2', score: 100 }),
      ]),
    )
    expect(stats.avg_score).toBe(60)
  })

  it('בלי ניסיונות — הממוצע 0', () => {
    const { stats } = recalculateUserStats(input([]))
    expect(stats.avg_score).toBe(0)
  })

  it('exam_attempt עם score לא-מספרי לא נספר בממוצע', () => {
    const { stats } = recalculateUserStats(
      input([
        event('exam_attempt', { exam_id: 'E1', score: null }),
        event('exam_attempt', { exam_id: 'E1', score: 90 }),
      ]),
    )
    expect(stats.avg_score).toBe(90)
  })
})

// ── המכנה האמיתי ו-avg_progress (PROGRESS_ENGINE.md §4) ────────────────────
describe('total_lessons_in_track + avg_progress', () => {
  it('המכנה סופר רק שיעורים published במסלולים published של מחלקת המשתמש', () => {
    const { stats } = recalculateUserStats(input([]))
    expect(stats.total_lessons_in_track).toBe(4) // L1-L4; draft/archived/מסלול-אחר בחוץ
    expect(stats.total_courses).toBe(1) // רק t1 רלוונטי
  })

  it('avg_progress = round(ייחודיים/מכנה×100)', () => {
    const { stats } = recalculateUserStats(
      input([
        event('lesson_completed', { lesson_id: 'L1' }),
        event('lesson_completed', { lesson_id: 'L1' }), // כפול — לא משנה את האחוז
      ]),
    )
    expect(stats.avg_progress).toBe(25) // 1 מתוך 4
  })

  it('avg_progress חסום ב-100 גם כשהושלמו יותר שיעורים מהמכנה', () => {
    const { stats } = recalculateUserStats(
      input(
        ['L1', 'L2', 'L3', 'L4', 'X-extra-1', 'X-extra-2'].map((lesson_id) =>
          event('lesson_completed', { lesson_id }),
        ),
      ),
    )
    expect(stats.avg_progress).toBe(100)
  })

  it('מכנה 0 (אין מסלול למחלקה) ⇒ avg_progress=0, לא 100% פיקטיבי (הכרעה 8-ב)', () => {
    const { stats } = recalculateUserStats(
      input([event('lesson_completed', { lesson_id: 'L1' })], {
        user: { id: USER_ID, department: 'הנהלה בלי מסלול' },
      }),
    )
    expect(stats.total_lessons_in_track).toBe(0)
    expect(stats.avg_progress).toBe(0)
  })
})

// ── XP — גזירה טהורה בלי ratchet (PROGRESS_ENGINE.md §5, הכרעה 8-א) ────────
describe('total_xp', () => {
  it('שיעורים×10 + מבחנים×25 + תעודות×50, על ספירות ייחודיות', () => {
    const { stats } = recalculateUserStats(
      input(
        [
          event('lesson_completed', { lesson_id: 'L1' }),
          event('lesson_completed', { lesson_id: 'L1' }), // כפול — לא מזכה XP
          event('lesson_completed', { lesson_id: 'L2' }),
          event('exam_passed', { exam_id: 'E1', score: 90 }),
        ],
        { certificatesCount: 3 },
      ),
    )
    expect(stats.total_xp).toBe(
      2 * XP_PER_LESSON + 1 * XP_PER_EXAM + 3 * XP_PER_CERTIFICATE,
    )
  })
})

// ── זמן ופעילות שבועית (PROGRESS_ENGINE.md §2-§3) ──────────────────────────
describe('זמן ופעילות', () => {
  it('total_time_spent_minutes סוכם רק מאירועי העידן-הנקי (מה-epoch והלאה)', () => {
    const { stats } = recalculateUserStats(
      input([
        event('lesson_started', {
          lesson_id: 'L1',
          time_spent_minutes: 7,
          created_date: RECENT_DATE,
        }),
        event('lesson_started', {
          lesson_id: 'L2',
          time_spent_minutes: 3,
          created_date: CLEAN_OFF_WINDOW, // נקי אך מחוץ לחלון — נספר ב-total
        }),
        event('lesson_completed', {
          lesson_id: 'L1',
          time_spent_minutes: null,
          created_date: RECENT_DATE,
        }),
      ]),
    )
    expect(stats.total_time_spent_minutes).toBe(10)
  })

  it('החלטת 13.3-ב: זמן מאירועי legacy (לפני ה-epoch) לא נספר — אבל השיעורים כן', () => {
    const { stats } = recalculateUserStats(
      input([
        // heartbeat היסטורי של Base44 — הדקות לא נכנסות לאף מדד זמן
        event('lesson_started', { lesson_id: 'L1', time_spent_minutes: 999 }),
        event('lesson_completed', {
          lesson_id: 'L1',
          time_spent_minutes: 45,
          completed_at: OLD_DATE,
        }),
      ]),
    )
    expect(stats.total_time_spent_minutes).toBe(0)
    expect(stats.weekly_time_spent_minutes).toBe(0)
    // עובדות הלמידה מהשכבה האמינה נשמרות
    expect(stats.lessons_completed).toBe(1)
    expect(stats.total_xp).toBe(XP_PER_LESSON)
  })

  it('גבול ה-epoch: אירוע בדיוק על הרגע הראשון של העידן-הנקי נספר', () => {
    const { stats } = recalculateUserStats(
      input([
        event('lesson_started', {
          lesson_id: 'L1',
          time_spent_minutes: 4,
          created_date: TIME_TRACKING_EPOCH,
        }),
      ]),
    )
    expect(stats.total_time_spent_minutes).toBe(4)
  })

  it('חלון שבועי לפי effective_date = completed_at ?? created_date', () => {
    const { stats } = recalculateUserStats(
      input([
        // lesson_started בלי completed_at — נופל ל-created_date (טרי)
        event('lesson_started', {
          lesson_id: 'L1',
          time_spent_minutes: 5,
          created_date: RECENT_DATE,
        }),
        // נקי אך מחוץ לחלון — נספר ב-total, לא ב-weekly
        event('lesson_started', {
          lesson_id: 'L2',
          time_spent_minutes: 9,
          created_date: CLEAN_OFF_WINDOW,
        }),
        // הושלם השבוע
        event('lesson_completed', {
          lesson_id: 'L1',
          completed_at: RECENT_DATE,
        }),
        // הושלם מזמן
        event('lesson_completed', { lesson_id: 'L2', completed_at: OLD_DATE }),
      ]),
    )
    expect(stats.weekly_time_spent_minutes).toBe(5)
    expect(stats.weekly_lessons).toBe(1)
  })

  it('weekly_lessons סופר שיעורים ייחודיים בחלון, לא אירועים כפולים', () => {
    const { stats } = recalculateUserStats(
      input([
        event('lesson_completed', {
          lesson_id: 'L1',
          completed_at: RECENT_DATE,
        }),
        event('lesson_completed', {
          lesson_id: 'L1',
          completed_at: RECENT_DATE,
        }),
        event('lesson_completed', {
          lesson_id: 'L2',
          completed_at: RECENT_DATE,
        }),
      ]),
    )
    expect(stats.weekly_lessons).toBe(2)
  })

  it('last_activity = האירוע האחרון בפועל, לא רגע החישוב (הכרעה 8-ד)', () => {
    const { stats } = recalculateUserStats(
      input([
        event('lesson_completed', { lesson_id: 'L1', completed_at: OLD_DATE }),
        event('lesson_started', {
          lesson_id: 'L2',
          created_date: RECENT_DATE,
        }),
      ]),
    )
    expect(stats.last_activity).toBe(RECENT_DATE)
  })

  it('בלי אירועים — last_activity=null וכל המונים 0', () => {
    const { stats } = recalculateUserStats(input([]))
    expect(stats.last_activity).toBeNull()
    expect(stats.lessons_completed).toBe(0)
    expect(stats.exams_passed).toBe(0)
    expect(stats.total_xp).toBe(0)
    expect(stats.total_time_spent_minutes).toBe(0)
  })
})

// ── עמידות לדאטה אמיתי (PROGRESS_ENGINE.md §2, הכרעה 8-ג) ──────────────────
describe('סוגי אירועים לא-נספרים', () => {
  it('lesson_quiz_attempt מוכר (legacy) — לא נספר באף מדד ולא נחשב ignored', () => {
    const { stats, ignoredEvents } = recalculateUserStats(
      input([event('lesson_quiz_attempt', { lesson_id: 'L1', score: 100 })]),
    )
    expect(stats.lessons_completed).toBe(0)
    expect(stats.avg_score).toBe(0)
    expect(ignoredEvents).toBe(0)
  })

  it('progress_type לא מוכר לא מפיל את החישוב ונספר ב-ignoredEvents', () => {
    const unknown = event('future_type_v9' as ProgressType, {
      lesson_id: 'L1',
    })
    const { stats, ignoredEvents } = recalculateUserStats(
      input([unknown, event('lesson_completed', { lesson_id: 'L1' })]),
    )
    expect(stats.lessons_completed).toBe(1)
    expect(ignoredEvents).toBe(1)
  })
})

// ── aliases היסטוריים ודטרמיניזם (PROGRESS_ENGINE.md §3, §7) ───────────────
describe('shape ודטרמיניזם', () => {
  const richEvents = (): UserProgress[] => [
    event('lesson_completed', { lesson_id: 'L1', completed_at: RECENT_DATE }),
    event('lesson_completed', { lesson_id: 'L2', completed_at: OLD_DATE }),
    event('exam_attempt', { exam_id: 'E1', score: 70 }),
    event('exam_passed', {
      exam_id: 'E1',
      score: 70,
      completed_at: RECENT_DATE,
    }),
    event('lesson_started', { lesson_id: 'L3', time_spent_minutes: 12 }),
    event('track_completed', { track_id: 't1' }),
  ]

  it('total_lessons ו-total_exams הם aliases של הספירות הייחודיות', () => {
    const { stats } = recalculateUserStats(input(richEvents()))
    expect(stats.total_lessons).toBe(stats.lessons_completed)
    expect(stats.total_exams).toBe(stats.exams_passed)
  })

  it('אותו קלט ⇒ אותו פלט, תמיד (עקביות — דרישת שלב 1.2)', () => {
    seq = 0
    const first = recalculateUserStats(input(richEvents()))
    seq = 0
    const second = recalculateUserStats(input(richEvents()))
    expect(second).toEqual(first)
  })

  it('החישוב לא משנה את מערך האירועים (הקלט immutable)', () => {
    const events = richEvents()
    const snapshot = JSON.parse(JSON.stringify(events))
    recalculateUserStats(input(events))
    expect(events).toEqual(snapshot)
  })
})
