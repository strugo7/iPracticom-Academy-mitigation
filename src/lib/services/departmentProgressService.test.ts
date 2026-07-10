/**
 * אגרגציה מחלקתית לדשבורד המנהלים (PROGRESS_ENGINE.md §12) — מריצה את המנוע
 * הקיים פר-חבר-מחלקה ומסכמת: leaderboard, ממוצעים ופעילות. טהורה, בלי רשת.
 */
import { describe, expect, it } from 'vitest'
import type { User, UserProgress } from '@/types/entities'
import { aggregateDepartmentProgress } from './departmentProgressService'
import type { InsightsInput } from './progressInsights'

const DEPT = 'תמיכה טכנית'
const NOW = new Date('2026-06-29T12:00:00.000Z')

const base = (id: string) => ({
  id,
  created_date: '2026-06-01T00:00:00.000Z',
  updated_date: '2026-06-01T00:00:00.000Z',
})

/** מסלול מחלקתי עם שני שיעורי published (מכנה 2) ומבחן-מסלול אחד */
const catalog = (): InsightsInput['catalog'] => ({
  tracks: [{ ...base('T1'), status: 'published', category: DEPT }],
  trackModules: [{ ...base('TM1'), track_id: 'T1', shared_module_id: 'M1' }],
  topics: [{ ...base('TP1'), shared_module_id: 'M1' }],
  lessons: [
    { id: 'L1', topic_id: 'TP1', status: 'published' },
    { id: 'L2', topic_id: 'TP1', status: 'published' },
  ],
  exams: [
    {
      id: 'E1',
      context_type: 'lesson',
      context_id: 'L1',
      status: 'published',
      is_entrance_exam: false,
    },
  ],
})

const member = (id: string, full_name: string): User => ({
  ...base(id),
  email: `${id}@x.com`,
  full_name,
  role: 'user',
  department: DEPT,
})

let seq = 0
const event = (
  user_id: string,
  progress_type: UserProgress['progress_type'],
  fields: Partial<UserProgress> = {},
): UserProgress => ({
  ...base(`e-${++seq}`),
  created_date: fields.created_date ?? '2026-06-28T10:00:00.000Z',
  user_id,
  progress_type,
  ...fields,
})

describe('aggregateDepartmentProgress', () => {
  const members = [member('u-a', 'אבי כהן'), member('u-b', 'בת-אל לוי')]
  const eventsByUserId = new Map<string, UserProgress[]>([
    [
      'u-a', // שיעור אחד (50%), נסיון מבחן עם ציון, פעיל השבוע
      [
        event('u-a', 'lesson_completed', { lesson_id: 'L1' }),
        event('u-a', 'exam_attempt', { exam_id: 'E1', score: 80 }),
      ],
    ],
    [
      'u-b', // שני שיעורים (100%) + מבחן עבר — אבל הכל לפני חודשיים
      [
        event('u-b', 'lesson_completed', {
          lesson_id: 'L1',
          created_date: '2026-05-01T10:00:00.000Z',
        }),
        event('u-b', 'lesson_completed', {
          lesson_id: 'L2',
          created_date: '2026-05-01T10:00:00.000Z',
        }),
        event('u-b', 'exam_passed', {
          exam_id: 'E1',
          created_date: '2026-05-01T10:00:00.000Z',
        }),
      ],
    ],
  ])

  const aggregate = () =>
    aggregateDepartmentProgress({
      department: DEPT,
      members,
      eventsByUserId,
      catalog: catalog(),
      now: NOW,
    })

  it('מריץ את המנוע פר-חבר: stats ו-insights לכל אחד, מאותו קטלוג', () => {
    const { members: result } = aggregate()
    expect(result).toHaveLength(2)
    const a = result.find((m) => m.user.id === 'u-a')
    const b = result.find((m) => m.user.id === 'u-b')
    expect(a?.stats).toMatchObject({
      lessons_completed: 1,
      avg_progress: 50,
      avg_score: 80,
    })
    expect(b?.stats).toMatchObject({
      lessons_completed: 2,
      avg_progress: 100,
      exams_passed: 1,
    })
    expect(b?.insights).toMatchObject({
      exams_passed_in_track: 1,
      total_exams_in_track: 1,
    })
  })

  it('ה-leaderboard ממוין לפי XP יורד עם דירוג רץ', () => {
    const { leaderboard } = aggregate()
    // u-b: 2×10 + 25 = 45 · u-a: 1×10 = 10
    expect(leaderboard).toEqual([
      { rank: 1, user_id: 'u-b', full_name: 'בת-אל לוי', total_xp: 45 },
      { rank: 2, user_id: 'u-a', full_name: 'אבי כהן', total_xp: 10 },
    ])
  })

  it('סיכום מחלקתי: ממוצעים, סכומים ופעילות שבועית', () => {
    const { summary } = aggregate()
    expect(summary).toEqual({
      member_count: 2,
      avg_progress: 75, // (50+100)/2
      avg_score: 80, // רק u-a ניגש למבחן — u-b בלי נסיונות לא מדלל את הממוצע
      lessons_completed_total: 3,
      exams_passed_total: 1,
      active_this_week: 1, // רק u-a פעיל בחלון
    })
  })

  it('חבר בלי אירועים: נספר במחלקה עם אפסים, לא מפיל את החישוב', () => {
    const result = aggregateDepartmentProgress({
      department: DEPT,
      members: [member('u-c', 'גדי רם')],
      eventsByUserId: new Map(),
      catalog: catalog(),
      now: NOW,
    })
    expect(result.members[0].stats.lessons_completed).toBe(0)
    expect(result.summary).toMatchObject({
      member_count: 1,
      avg_score: 0,
      active_this_week: 0,
    })
  })

  it('מחלקה ריקה — מבנה מאופס', () => {
    const result = aggregateDepartmentProgress({
      department: DEPT,
      members: [],
      eventsByUserId: new Map(),
      catalog: catalog(),
      now: NOW,
    })
    expect(result.members).toEqual([])
    expect(result.leaderboard).toEqual([])
    expect(result.summary).toEqual({
      member_count: 0,
      avg_progress: 0,
      avg_score: 0,
      lessons_completed_total: 0,
      exams_passed_total: 0,
      active_this_week: 0,
    })
  })
})
