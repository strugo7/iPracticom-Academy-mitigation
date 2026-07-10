/**
 * אגרגציה מחלקתית לדשבורד המנהלים (PROGRESS_ENGINE.md §12).
 *
 * לא מחשבת התקדמות בעצמה: מריצה את recalculateUserStats + deriveProgressInsights
 * פר-חבר-מחלקה (אותו מנוע של הדשבורד האישי — אותם מספרים בהגדרה) ומסכמת.
 * טהורה: אותו קלט ⇒ אותו פלט; שליפת הקלט באחריות useDepartmentProgress.
 */
import type { User, UserProgress } from '@/types/entities'
import {
  deriveProgressInsights,
  type InsightsInput,
  type ProgressInsights,
} from './progressInsights'
import {
  effectiveDate,
  recalculateUserStats,
  type ProgressStats,
} from './progressService'

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000

export interface DepartmentProgressInput {
  department: string
  /** חברי המחלקה (הסינון לפי managed_department באחריות ה-hook) */
  members: User[]
  /** אירועי UserProgress מקובצים לפי user_id; חבר חסר = בלי אירועים */
  eventsByUserId: Map<string, UserProgress[]>
  catalog: InsightsInput['catalog']
  now: Date
}

export interface DepartmentMemberProgress {
  user: Pick<User, 'id' | 'full_name' | 'email' | 'department'>
  stats: ProgressStats
  insights: ProgressInsights
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  full_name: string
  total_xp: number
}

export interface DepartmentSummary {
  member_count: number
  /** ממוצע avg_progress על כל החברים, מעוגל */
  avg_progress: number
  /** ממוצע avg_score רק על חברים שניגשו למבחן — חבר בלי נסיונות לא מדלל */
  avg_score: number
  lessons_completed_total: number
  exams_passed_total: number
  /** חברים עם פעילות בחלון 7 הימים של now */
  active_this_week: number
}

export interface DepartmentProgress {
  department: string
  members: DepartmentMemberProgress[]
  /** ממוין לפי XP יורד; שוויון נשבר לפי שם (דטרמיניזם) */
  leaderboard: LeaderboardEntry[]
  summary: DepartmentSummary
}

export function aggregateDepartmentProgress(
  input: DepartmentProgressInput,
): DepartmentProgress {
  const { department, members, eventsByUserId, catalog, now } = input
  const weekAgoMs = now.getTime() - WEEK_IN_MS

  let progressSum = 0
  let scoreSum = 0
  let scoredMembers = 0
  let lessonsTotal = 0
  let examsTotal = 0
  let activeThisWeek = 0

  const memberProgress: DepartmentMemberProgress[] = members.map((user) => {
    const events = eventsByUserId.get(user.id) ?? []
    const progressInput = {
      user: { id: user.id, department: user.department ?? null },
      events,
      catalog,
      certificatesCount: 0, // יחווט בשלב התעודות — כמו ב-useProgress
      now,
    }
    const { stats } = recalculateUserStats(progressInput)
    const insights = deriveProgressInsights(
      { ...progressInput, catalog },
      stats,
    )

    progressSum += stats.avg_progress
    lessonsTotal += stats.lessons_completed
    examsTotal += stats.exams_passed
    const attempted = events.some(
      (e) => e.progress_type === 'exam_attempt' && typeof e.score === 'number',
    )
    if (attempted) {
      scoreSum += stats.avg_score
      scoredMembers++
    }
    if (events.some((e) => Date.parse(effectiveDate(e)) >= weekAgoMs)) {
      activeThisWeek++
    }

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        department: user.department ?? null,
      },
      stats,
      insights,
    }
  })

  const leaderboard: LeaderboardEntry[] = memberProgress
    .map((m) => ({
      user_id: m.user.id,
      full_name: m.user.full_name,
      total_xp: m.stats.total_xp,
    }))
    .sort(
      (a, b) =>
        b.total_xp - a.total_xp || a.full_name.localeCompare(b.full_name, 'he'),
    )
    .map((entry, i) => ({ rank: i + 1, ...entry }))

  return {
    department,
    members: memberProgress,
    leaderboard,
    summary: {
      member_count: members.length,
      avg_progress:
        members.length > 0 ? Math.round(progressSum / members.length) : 0,
      avg_score: scoredMembers > 0 ? Math.round(scoreSum / scoredMembers) : 0,
      lessons_completed_total: lessonsTotal,
      exams_passed_total: examsTotal,
      active_this_week: activeThisWeek,
    },
  }
}
