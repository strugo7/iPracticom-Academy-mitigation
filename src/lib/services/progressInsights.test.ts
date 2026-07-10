/**
 * progressInsights — מדדי-התצוגה שמעל המנוע (PROGRESS_ENGINE.md §10):
 * מבחנים-במסלול (המונה והמכנה של "מבחנים שעברת 4/6"), רמת XP, פעילות יומית.
 * המנוע עצמו (recalculateUserStats) לא משתנה — זו שכבה נגזרת נפרדת.
 */
import { describe, expect, it } from 'vitest'
import type { Exam, UserProgress } from '@/types/entities'
import {
  XP_PER_LEVEL,
  deriveProgressInsights,
  type InsightsInput,
} from './progressInsights'

const base = (id: string) => ({
  id,
  created_date: '2026-06-01T00:00:00.000Z',
  updated_date: '2026-06-01T00:00:00.000Z',
})

/** קטלוג מינימלי: מסלול published של "תמיכה טכנית" עם שיעור published אחד */
const catalog = (): InsightsInput['catalog'] => ({
  tracks: [
    { ...base('T1'), status: 'published', category: 'תמיכה טכנית' },
    { ...base('T2'), status: 'published', category: 'הנהלה' },
  ],
  trackModules: [
    { ...base('TM1'), track_id: 'T1', shared_module_id: 'M1' },
    { ...base('TM2'), track_id: 'T2', shared_module_id: 'M2' },
  ],
  topics: [
    { ...base('TP1'), shared_module_id: 'M1' },
    { ...base('TP2'), shared_module_id: 'M2' },
  ],
  lessons: [
    { id: 'L1', topic_id: 'TP1', status: 'published' },
    { id: 'L2', topic_id: 'TP1', status: 'draft' },
    { id: 'LX', topic_id: 'TP2', status: 'published' },
  ],
  exams: [],
})

const exam = (
  id: string,
  fields: Partial<
    Pick<Exam, 'context_type' | 'context_id' | 'status' | 'is_entrance_exam'>
  >,
): InsightsInput['catalog']['exams'][number] => ({
  id,
  context_type: 'none',
  context_id: null,
  status: 'published',
  is_entrance_exam: false,
  ...fields,
})

const event = (
  progress_type: UserProgress['progress_type'],
  fields: Partial<UserProgress> = {},
): UserProgress => ({
  ...base(`e-${Math.random().toString(36).slice(2)}`),
  user_id: 'U1',
  progress_type,
  ...fields,
})

// עידן-נקי (אחרי TIME_TRACKING_EPOCH = 2026-07-10) — מדדי זמן נספרים
const NOW = new Date('2026-07-20T12:00:00.000Z')

const derive = (overrides: Partial<InsightsInput> = {}, totalXp = 0) =>
  deriveProgressInsights(
    {
      user: { id: 'U1', department: 'תמיכה טכנית' },
      events: [],
      catalog: catalog(),
      certificatesCount: 0,
      now: NOW,
      ...overrides,
    },
    { total_xp: totalXp },
  )

describe('רמת XP (נגזרת מ-total_xp, מדרגת XP_PER_LEVEL)', () => {
  it('משחזר את עוגן המוקאפ המאושר: 1,240 XP ⇒ רמה 4, עוד 160 לרמה הבאה', () => {
    const { level, xp_to_next_level } = derive({}, 1240)
    expect(level).toBe(4)
    expect(xp_to_next_level).toBe(160)
  })

  it('משתמש חדש: 0 XP ⇒ רמה 1, מדרגה מלאה לרמה הבאה', () => {
    const { level, xp_to_next_level } = derive({}, 0)
    expect(level).toBe(1)
    expect(xp_to_next_level).toBe(XP_PER_LEVEL)
  })

  it('בדיוק על סף רמה: XP_PER_LEVEL ⇒ רמה 2, מדרגה מלאה', () => {
    const { level, xp_to_next_level } = derive({}, XP_PER_LEVEL)
    expect(level).toBe(2)
    expect(xp_to_next_level).toBe(XP_PER_LEVEL)
  })
})

describe('מבחנים במסלול — המכנה של "מבחנים שעברת X/Y"', () => {
  it('סופר רק מבחני published שמעוגנים בתוכן המסלול, בלי מבחני כניסה', () => {
    const cat = catalog()
    cat.exams = [
      exam('E1', { context_type: 'lesson', context_id: 'L1' }), // ✓ במסלול
      exam('E2', { context_type: 'lesson', context_id: 'L1', status: 'draft' }), // draft
      exam('E3', { context_type: 'lesson', context_id: 'LX' }), // מסלול אחר
      exam('E4', { context_type: 'topic', context_id: 'TP1' }), // ✓ עוגן-נושא
      exam('E5', { context_type: 'none' }), // בלי הקשר
      exam('E6', {
        context_type: 'lesson',
        context_id: 'L1',
        is_entrance_exam: true,
      }),
    ]
    expect(derive({ catalog: cat }).total_exams_in_track).toBe(2)
  })

  it('מבחן שעוגן בשיעור draft לא נספר במכנה (עקבי למכנה השיעורים)', () => {
    const cat = catalog()
    cat.exams = [exam('E1', { context_type: 'lesson', context_id: 'L2' })]
    expect(derive({ catalog: cat }).total_exams_in_track).toBe(0)
  })

  it('המונה: exam_passed ייחודי ורק על מבחני המסלול', () => {
    const cat = catalog()
    cat.exams = [
      exam('E1', { context_type: 'lesson', context_id: 'L1' }),
      exam('E4', { context_type: 'topic', context_id: 'TP1' }),
    ]
    const events = [
      event('exam_passed', { exam_id: 'E1' }),
      event('exam_passed', { exam_id: 'E1' }), // כפילות — לא נספרת פעמיים
      event('exam_passed', { exam_id: 'OUT' }), // מבחן מחוץ למסלול
    ]
    const insights = derive({ catalog: cat, events })
    expect(insights.exams_passed_in_track).toBe(1)
    expect(insights.total_exams_in_track).toBe(2)
  })

  it('משתמש בלי מסלול רלוונטי: 0/0 — לא נופל', () => {
    const insights = derive({ user: { id: 'U1', department: null } })
    expect(insights.total_exams_in_track).toBe(0)
    expect(insights.exams_passed_in_track).toBe(0)
  })
})

describe('פעילות יומית — 7 ימים קלנדריים ב-Asia/Jerusalem, מהישן לחדש', () => {
  it('מחזיר תמיד 7 דליים מלאי-אפסים עם תאריכי ירושלים רציפים', () => {
    const { daily_activity } = derive()
    expect(daily_activity).toHaveLength(7)
    expect(daily_activity[0].date).toBe('2026-07-14')
    expect(daily_activity[6].date).toBe('2026-07-20')
    for (const day of daily_activity) {
      expect(day.lessons).toBe(0)
      expect(day.minutes).toBe(0)
    }
  })

  it('משבץ אירוע לפי היום בירושלים, לא לפי UTC (22:30Z = יום המחרת בקיץ)', () => {
    const events = [
      event('lesson_completed', {
        lesson_id: 'L1',
        completed_at: '2026-07-19T22:30:00.000Z', // 20.7 01:30 בירושלים
      }),
    ]
    const { daily_activity } = derive({ events })
    expect(daily_activity[6]).toMatchObject({ date: '2026-07-20', lessons: 1 })
    expect(daily_activity[5].lessons).toBe(0)
  })

  it('שיעורים ייחודיים פר-יום, דקות נסכמות, ואירוע ישן מחוץ לחלון לא נספר', () => {
    const events = [
      // אותו שיעור פעמיים באותו יום — נספר פעם אחת
      event('lesson_completed', {
        lesson_id: 'L1',
        completed_at: '2026-07-20T05:00:00.000Z',
      }),
      event('lesson_completed', {
        lesson_id: 'L1',
        completed_at: '2026-07-20T08:00:00.000Z',
      }),
      // דקות למידה ב-18.7 (effective_date = created_date כשאין completed_at)
      event('lesson_started', {
        lesson_id: 'L1',
        time_spent_minutes: 30,
        created_date: '2026-07-18T10:00:00.000Z',
      }),
      event('lesson_started', {
        lesson_id: 'L2',
        time_spent_minutes: 12,
        created_date: '2026-07-18T15:00:00.000Z',
      }),
      // מחוץ לחלון
      event('lesson_completed', {
        lesson_id: 'L2',
        completed_at: '2026-06-01T10:00:00.000Z',
      }),
    ]
    const { daily_activity } = derive({ events })
    expect(daily_activity[6]).toMatchObject({ date: '2026-07-20', lessons: 1 })
    expect(daily_activity[4]).toMatchObject({ date: '2026-07-18', minutes: 42 })
    const totalLessons = daily_activity.reduce((n, d) => n + d.lessons, 0)
    expect(totalLessons).toBe(1)
  })

  it('החלטת 13.3-ב: חלון שחוצה את ה-epoch — דקות legacy לא נספרות, שיעורים כן', () => {
    // NOW=12.7 ⇒ החלון 6.7–12.7 חוצה את ה-epoch (10.7)
    const crossEpochNow = new Date('2026-07-12T12:00:00.000Z')
    const events = [
      // לפני ה-epoch: heartbeat היסטורי — הדקות מוחרגות, ההשלמה נספרת
      event('lesson_started', {
        lesson_id: 'L1',
        time_spent_minutes: 50,
        created_date: '2026-07-08T09:00:00.000Z',
      }),
      event('lesson_completed', {
        lesson_id: 'L1',
        completed_at: '2026-07-08T10:00:00.000Z',
      }),
      // אחרי ה-epoch: נספר במלואו
      event('lesson_started', {
        lesson_id: 'L2',
        time_spent_minutes: 20,
        created_date: '2026-07-11T09:00:00.000Z',
      }),
    ]
    const { daily_activity } = derive({ events, now: crossEpochNow })
    const day8 = daily_activity.find((d) => d.date === '2026-07-08')
    const day11 = daily_activity.find((d) => d.date === '2026-07-11')
    expect(day8).toMatchObject({ lessons: 1, minutes: 0 })
    expect(day11).toMatchObject({ lessons: 0, minutes: 20 })
  })
})
