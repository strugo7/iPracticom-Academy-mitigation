/**
 * לוגיקת דשבורד המנהלים (doc 10) — נגזרים טהורים מעל DepartmentProgress
 * (Phase 1, PROGRESS_ENGINE.md §12). לא מחשב התקדמות בעצמו — צורך רק
 * stats/insights שכבר חושבו ע"י aggregateDepartmentProgress.
 *
 * כללי "בסיכון" (doc 10 §3): התקדמות נמוכה / לא פעיל / ציון מבחן נמוך.
 * "נכשל במבחנים" בבריף מוחלף בציון-ממוצע-נמוך: המנוע חושף avg_score
 * מצטבר, לא ניסיונות-כישלון בודדים — קירוב מתועד, לא ספירת-כישלונות אמיתית.
 */
import type {
  DepartmentMemberProgress,
  DepartmentProgress,
} from '@/lib/services/departmentProgressService'
import type {
  ComparisonBar,
  ComparisonMetric,
  DeptKpis,
  ManagerDashboardViewModel,
  MemberStatus,
  TeamMemberRow,
} from '../types'

/** התקדמות ממוצעת מתחת לסף = סימן ראשון לפיגור (doc 10 §3) */
export const AT_RISK_PROGRESS_THRESHOLD = 40
/** ציון ממוצע מתחת לסף — תואם את passing_score=70 הנצפה בדאטה (PROGRESS_ENGINE.md §13.2) */
export const AT_RISK_SCORE_THRESHOLD = 70
/** ימים בלי אף אירוע = "לא פעיל" (doc 10 §3) */
export const AT_RISK_INACTIVE_DAYS = 7
const DAY_IN_MS = 24 * 60 * 60 * 1000
/** רצפת-רוחב חזותית לבר השוואה — כמו העיצוב המקורי (ManagerDashboard.dc.html) */
const MIN_BAR_PERCENT = 4

export function initialOf(fullName: string): string {
  return fullName.trim().charAt(0) || '?'
}

function daysSince(iso: string | null, now: Date): number | null {
  if (!iso) return null
  return Math.floor((now.getTime() - Date.parse(iso)) / DAY_IN_MS)
}

function formatLastActivity(days: number | null): string {
  if (days === null) return 'מעולם לא היה פעיל'
  if (days <= 0) return 'היום'
  if (days === 1) return 'אתמול'
  return `לפני ${days} ימים`
}

/** סיבות-בסיכון לחבר בודד; מערך ריק = לא בסיכון */
export function deriveAtRiskReasons(
  member: DepartmentMemberProgress,
  now: Date,
): string[] {
  const reasons: string[] = []
  const { stats } = member
  if (stats.avg_progress < AT_RISK_PROGRESS_THRESHOLD) {
    reasons.push(`התקדמות ${stats.avg_progress}%`)
  }
  if (member.attemptedExam && stats.avg_score < AT_RISK_SCORE_THRESHOLD) {
    reasons.push(`ציון מבחן ממוצע נמוך (${stats.avg_score})`)
  }
  const days = daysSince(stats.last_activity, now)
  if (days === null || days >= AT_RISK_INACTIVE_DAYS) {
    reasons.push(days === null ? 'מעולם לא היה פעיל' : `לא פעיל ${days} ימים`)
  }
  return reasons
}

function deriveStatus(
  stats: DepartmentMemberProgress['stats'],
  atRiskReasons: string[],
): MemberStatus {
  if (atRiskReasons.length > 0) return 'risk'
  return stats.avg_progress >= 100 ? 'done' : 'active'
}

export function buildTeamRows(
  dept: DepartmentProgress,
  now: Date,
): TeamMemberRow[] {
  const trackTitleById = new Map(dept.tracks.map((t) => [t.id, t.title ?? '']))
  return dept.members.map((member) => {
    const atRiskReasons = deriveAtRiskReasons(member, now)
    const days = daysSince(member.stats.last_activity, now)
    return {
      userId: member.user.id,
      fullName: member.user.full_name,
      initial: initialOf(member.user.full_name),
      trackTitle: member.user.assigned_track_id
        ? (trackTitleById.get(member.user.assigned_track_id) ?? null)
        : null,
      progress: member.stats.avg_progress,
      avgScore: member.stats.avg_score,
      hasExamAttempt: member.attemptedExam,
      totalXp: member.stats.total_xp,
      totalTimeMinutes: member.stats.total_time_spent_minutes,
      lastActivityLabel: formatLastActivity(days),
      lastActivityDays: days,
      status: deriveStatus(member.stats, atRiskReasons),
      atRiskReasons,
    }
  })
}

export function buildDeptKpis(
  dept: DepartmentProgress,
  rows: TeamMemberRow[],
): DeptKpis {
  const memberCount = dept.summary.member_count
  const doneCount = rows.filter((r) => r.status === 'done').length
  return {
    memberCount,
    avgProgress: dept.summary.avg_progress,
    completionRatePercent:
      memberCount > 0 ? Math.round((doneCount / memberCount) * 100) : 0,
    avgScore: dept.summary.avg_score,
    activeThisWeek: dept.summary.active_this_week,
    // certificates_earned מחווט 0 עד שלב התעודות (PROGRESS_ENGINE.md — פער ידוע,
    // כמו KpiCards.tsx של הדשבורד האישי; לא הוצג "לא זמין" — עקביות עם התקדים הקיים)
    certificatesTotal: dept.members.reduce(
      (sum, m) => sum + m.stats.certificates_earned,
      0,
    ),
    atRiskCount: rows.filter((r) => r.status === 'risk').length,
  }
}

const METRIC_CONFIG: Record<
  ComparisonMetric,
  {
    label: string
    value: (row: TeamMemberRow) => number
    display: (row: TeamMemberRow) => string
  }
> = {
  progress: {
    label: 'התקדמות',
    value: (r) => r.progress,
    display: (r) => `${r.progress}%`,
  },
  score: {
    label: 'ציון ממוצע',
    value: (r) => (r.hasExamAttempt ? r.avgScore : 0),
    display: (r) => (r.hasExamAttempt ? String(r.avgScore) : '—'),
  },
  xp: {
    label: 'נקודות XP',
    value: (r) => r.totalXp,
    display: (r) => r.totalXp.toLocaleString('he-IL'),
  },
  time: {
    label: 'זמן למידה',
    value: (r) => r.totalTimeMinutes,
    display: (r) => `${(r.totalTimeMinutes / 60).toFixed(1)} שע׳`,
  },
}

export const COMPARISON_METRICS: {
  id: ComparisonMetric
  label: string
}[] = (Object.keys(METRIC_CONFIG) as ComparisonMetric[]).map((id) => ({
  id,
  label: METRIC_CONFIG[id].label,
}))

export function buildComparisonBars(
  rows: TeamMemberRow[],
  metric: ComparisonMetric,
): ComparisonBar[] {
  const cfg = METRIC_CONFIG[metric]
  const values = rows.map(cfg.value)
  const max = Math.max(1, ...values)
  return rows
    .map((row) => ({ row, value: cfg.value(row) }))
    .sort((a, b) => b.value - a.value)
    .map(({ row, value }) => ({
      userId: row.userId,
      fullName: row.fullName,
      initial: row.initial,
      displayValue: cfg.display(row),
      percentOfMax: Math.max(
        MIN_BAR_PERCENT,
        Math.round((value / max) * 100),
      ),
      status: row.status,
    }))
}

export type TeamSortKey =
  | 'name'
  | 'track'
  | 'progress'
  | 'score'
  | 'last'
  | 'status'
export type TeamSortDir = 'asc' | 'desc'

const STATUS_RANK: Record<MemberStatus, number> = { risk: 0, active: 1, done: 2 }

/** מיון-לחיצה-על-כותרת של טבלת הצוות — עותק ממוין, לא משנה את המקור */
export function sortTeamRows(
  rows: TeamMemberRow[],
  key: TeamSortKey,
  dir: TeamSortDir,
): TeamMemberRow[] {
  const sign = dir === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    let diff = 0
    switch (key) {
      case 'name':
        diff = a.fullName.localeCompare(b.fullName, 'he')
        break
      case 'track':
        diff = (a.trackTitle ?? '').localeCompare(b.trackTitle ?? '', 'he')
        break
      case 'progress':
        diff = a.progress - b.progress
        break
      case 'score':
        diff = a.avgScore - b.avgScore
        break
      case 'last':
        diff = (a.lastActivityDays ?? Infinity) - (b.lastActivityDays ?? Infinity)
        break
      case 'status':
        diff = STATUS_RANK[a.status] - STATUS_RANK[b.status]
        break
    }
    return diff * sign
  })
}

export function assembleManagerDashboard(
  dept: DepartmentProgress,
  now: Date,
): ManagerDashboardViewModel {
  const rows = buildTeamRows(dept, now)
  return {
    departmentName: dept.department,
    kpis: buildDeptKpis(dept, rows),
    rows,
    atRisk: rows.filter((r) => r.status === 'risk'),
  }
}
