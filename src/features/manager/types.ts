/**
 * טיפוסי ה-view-model של דשבורד המנהלים (doc 10) — נגזרים ע"י
 * managerDashboardService מ-DepartmentProgress (Phase 1, §12). לא ישויות
 * גולמיות ולא state שמור — נבנה מחדש בכל render.
 */
export type MemberStatus = 'done' | 'active' | 'risk'

export type ComparisonMetric = 'progress' | 'score' | 'xp' | 'time'

export interface TeamMemberRow {
  userId: string
  fullName: string
  initial: string
  trackTitle: string | null
  progress: number
  avgScore: number
  hasExamAttempt: boolean
  totalXp: number
  totalTimeMinutes: number
  lastActivityLabel: string
  /** ימים מאז last_activity; null = מעולם לא היה פעיל */
  lastActivityDays: number | null
  status: MemberStatus
  /** ריק = לא בסיכון */
  atRiskReasons: string[]
}

export interface ComparisonBar {
  userId: string
  fullName: string
  initial: string
  displayValue: string
  /** 4–100, עם רצפת-מינימום חזותית כמו העיצוב המקורי */
  percentOfMax: number
  status: MemberStatus
}

export interface DeptKpis {
  memberCount: number
  avgProgress: number
  /** % חברים שהגיעו ל-100% התקדמות ("משפך השלמות", doc 10 §3) */
  completionRatePercent: number
  avgScore: number
  activeThisWeek: number
  certificatesTotal: number
  atRiskCount: number
}

export interface ManagerDashboardViewModel {
  departmentName: string
  kpis: DeptKpis
  rows: TeamMemberRow[]
  atRisk: TeamMemberRow[]
}
