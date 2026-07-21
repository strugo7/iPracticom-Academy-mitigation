import { describe, expect, it } from 'vitest'
import type { DepartmentProgress } from '@/lib/services/departmentProgressService'
import {
  assembleManagerDashboard,
  buildComparisonBars,
  buildDeptKpis,
  buildTeamRows,
  deriveAtRiskReasons,
  sortTeamRows,
} from './managerDashboardService'

const NOW = new Date('2026-07-11T12:00:00.000Z')

const stats = (overrides: Partial<DepartmentProgress['members'][number]['stats']> = {}) => ({
  lessons_completed: 0,
  total_lessons: 0,
  total_lessons_in_track: 10,
  completed_courses: 0,
  total_courses: 1,
  exams_passed: 0,
  total_exams: 0,
  avg_score: 0,
  avg_progress: 0,
  certificates_earned: 0,
  total_xp: 0,
  total_time_spent_minutes: 0,
  weekly_lessons: 0,
  weekly_time_spent_minutes: 0,
  last_activity: null,
  ...overrides,
})

const insights = {
  total_exams_in_track: 1,
  exams_passed_in_track: 0,
  level: 1,
  xp_to_next_level: 350,
  daily_activity: [],
}

function member(
  id: string,
  fullName: string,
  overrides: Partial<DepartmentProgress['members'][number]['stats']> = {},
  extra: { attemptedExam?: boolean; assigned_track_id?: string | null } = {},
): DepartmentProgress['members'][number] {
  return {
    user: {
      id,
      full_name: fullName,
      email: `${id}@x.com`,
      department: 'תמיכה טכנית',
      assigned_track_id: extra.assigned_track_id ?? 'T1',
    },
    stats: stats(overrides),
    insights,
    attemptedExam: extra.attemptedExam ?? false,
  }
}

function dept(
  members: DepartmentProgress['members'],
): DepartmentProgress {
  return {
    department: 'תמיכה טכנית',
    members,
    leaderboard: [],
    tracks: [{ id: 'T1', title: 'פתרון תקלות רשת', created_date: '', updated_date: '' }],
    summary: {
      member_count: members.length,
      avg_progress: 0,
      avg_score: 0,
      lessons_completed_total: 0,
      exams_passed_total: 0,
      active_this_week: 0,
    },
  }
}

describe('deriveAtRiskReasons', () => {
  it('חבר בריא — בלי סיבות', () => {
    const m = member('a', 'רוני', {
      avg_progress: 80,
      avg_score: 90,
      last_activity: NOW.toISOString(),
    }, { attemptedExam: true })
    expect(deriveAtRiskReasons(m, NOW)).toEqual([])
  })

  it('התקדמות נמוכה מסומנת', () => {
    const m = member('a', 'עמית', {
      avg_progress: 18,
      last_activity: NOW.toISOString(),
    })
    expect(deriveAtRiskReasons(m, NOW)).toEqual(
      expect.arrayContaining(['התקדמות 18%']),
    )
  })

  it('ציון ממוצע נמוך מסומן רק אם ניגש למבחן בפועל', () => {
    const attempted = member('a', 'עמית', { avg_progress: 80, avg_score: 61, last_activity: NOW.toISOString() }, { attemptedExam: true })
    const notAttempted = member('b', 'טל', { avg_progress: 80, avg_score: 0, last_activity: NOW.toISOString() }, { attemptedExam: false })
    expect(deriveAtRiskReasons(attempted, NOW)).toEqual(
      expect.arrayContaining(['ציון מבחן ממוצע נמוך (61)']),
    )
    expect(deriveAtRiskReasons(notAttempted, NOW)).toEqual([])
  })

  it('לא פעיל מעל הסף מסומן, ומעולם-לא-פעיל מטופל בנפרד', () => {
    const stale = member('a', 'טל', {
      avg_progress: 80,
      last_activity: new Date(NOW.getTime() - 12 * 86400000).toISOString(),
    })
    const never = member('b', 'נועה', { avg_progress: 80, last_activity: null })
    expect(deriveAtRiskReasons(stale, NOW)).toEqual(
      expect.arrayContaining(['לא פעיל 12 ימים']),
    )
    expect(deriveAtRiskReasons(never, NOW)).toEqual(
      expect.arrayContaining(['מעולם לא היה פעיל']),
    )
  })
})

describe('buildTeamRows', () => {
  it('סטטוס done כשההתקדמות 100, אחרת active/risk לפי הכללים', () => {
    const done = member('a', 'רוני', { avg_progress: 100, avg_score: 94, last_activity: NOW.toISOString() }, { attemptedExam: true })
    const risky = member('b', 'עמית', { avg_progress: 18, last_activity: NOW.toISOString() })
    const rows = buildTeamRows(dept([done, risky]), NOW)
    expect(rows.find((r) => r.userId === 'a')?.status).toBe('done')
    expect(rows.find((r) => r.userId === 'b')?.status).toBe('risk')
  })

  it('פותר את כותרת המסלול המוקצה מהקטלוג', () => {
    const m = member('a', 'רוני', { avg_progress: 50, last_activity: NOW.toISOString() })
    const rows = buildTeamRows(dept([m]), NOW)
    expect(rows[0].trackTitle).toBe('פתרון תקלות רשת')
  })
})

describe('buildDeptKpis', () => {
  it('שיעור השלמה = % חברים ב-100%, ואחוז בסיכון נספר מהשורות', () => {
    const done = member('a', 'רוני', { avg_progress: 100, last_activity: NOW.toISOString() })
    const risky = member('b', 'עמית', { avg_progress: 18, last_activity: NOW.toISOString() })
    const d = dept([done, risky])
    d.summary.member_count = 2
    const rows = buildTeamRows(d, NOW)
    const kpis = buildDeptKpis(d, rows)
    expect(kpis.completionRatePercent).toBe(50)
    expect(kpis.atRiskCount).toBe(1)
  })
})

describe('buildComparisonBars', () => {
  it('ממוין יורד לפי המדד, עם רצפת-מינימום חזותית', () => {
    const a = member('a', 'רוני', { avg_progress: 80, total_xp: 100, last_activity: NOW.toISOString() })
    const b = member('b', 'עמית', { avg_progress: 20, total_xp: 900, last_activity: NOW.toISOString() })
    const rows = buildTeamRows(dept([a, b]), NOW)
    const byProgress = buildComparisonBars(rows, 'progress')
    expect(byProgress.map((x) => x.userId)).toEqual(['a', 'b'])
    const byXp = buildComparisonBars(rows, 'xp')
    expect(byXp.map((x) => x.userId)).toEqual(['b', 'a'])
    expect(byXp.every((x) => x.percentOfMax >= 4)).toBe(true)
  })
})

describe('sortTeamRows', () => {
  it('ממיין לפי שם ולפי סטטוס ללא לשנות את המקור', () => {
    const a = member('a', 'ב-שם', { avg_progress: 80, last_activity: NOW.toISOString() })
    const b = member('b', 'א-שם', { avg_progress: 18, last_activity: NOW.toISOString() })
    const rows = buildTeamRows(dept([a, b]), NOW)
    const byName = sortTeamRows(rows, 'name', 'asc')
    expect(byName[0].fullName).toBe('א-שם')
    expect(rows[0].userId).toBe('a') // המקור לא השתנה

    const byStatus = sortTeamRows(rows, 'status', 'asc')
    expect(byStatus[0].status).toBe('risk')
  })
})

describe('assembleManagerDashboard', () => {
  it('מרכיב view-model שלם עם רשימת בסיכון מסוננת', () => {
    const risky = member('a', 'עמית', { avg_progress: 18, last_activity: NOW.toISOString() })
    const ok = member('b', 'רוני', { avg_progress: 80, avg_score: 90, last_activity: NOW.toISOString() }, { attemptedExam: true })
    const vm = assembleManagerDashboard(dept([risky, ok]), NOW)
    expect(vm.atRisk.map((r) => r.userId)).toEqual(['a'])
    expect(vm.departmentName).toBe('תמיכה טכנית')
  })
})
