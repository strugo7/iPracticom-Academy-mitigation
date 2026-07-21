/**
 * לוח מובילים כלל-ארגוני (SRS §2.3 getLeaderboard) — מורכב מאותם רכיבים
 * כמו הדשבורד המחלקתי (departmentProgressService.ts): מריץ recalculateUserStats
 * פר-משתמש ומדרג לפי total_xp. אותו מנוע, אותם מספרים בהגדרה.
 */
import type { User, UserProgress } from '@/types/entities'
import { recalculateUserStats, type ProgressInput } from './progressService'

export interface LeaderboardEntry {
  rank: number
  user_id: string
  full_name: string
  total_xp: number
}

export interface LeaderboardInput {
  members: User[]
  /** אירועי UserProgress מקובצים לפי user_id; חבר חסר = בלי אירועים */
  eventsByUserId: Map<string, UserProgress[]>
  catalog: ProgressInput['catalog']
  now: Date
}

/** ממוין לפי XP יורד; שוויון נשבר לפי שם (דטרמיניזם) — זהה לכלל בדשבורד המחלקתי */
export function computeLeaderboard(input: LeaderboardInput): LeaderboardEntry[] {
  const { members, eventsByUserId, catalog, now } = input

  const entries = members.map((user) => {
    const { stats } = recalculateUserStats({
      user: { id: user.id, department: user.department ?? null },
      events: eventsByUserId.get(user.id) ?? [],
      catalog,
      certificatesCount: 0,
      now,
    })
    return {
      user_id: user.id,
      full_name: user.full_name,
      total_xp: stats.total_xp,
    }
  })

  return entries
    .sort(
      (a, b) =>
        b.total_xp - a.total_xp || a.full_name.localeCompare(b.full_name, 'he'),
    )
    .map((entry, i) => ({ rank: i + 1, ...entry }))
}
