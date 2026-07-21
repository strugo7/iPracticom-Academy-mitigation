/**
 * useLeaderboard — לוח מובילים כלל-ארגוני לדשבורד האישי (SRS §2.3 getLeaderboard).
 * אוסף את כל המשתמשים + כל אירועי ה-UserProgress + הקטלוג, ומריץ את אותה
 * אגרגציה טהורה של departmentProgressService — Top-N + המיקום של המשתמש הנוכחי
 * (גם כשהוא מחוץ ל-Top-N, לצורך הדגשה בטבלה).
 *
 * הערת ביצועים (RealApi, Phase 12): כמו ב-useDepartmentProgress — אגרגציה
 * בצד הלקוח על כל המשתמשים; מול ה-API הארגוני יידרש endpoint ייעודי.
 */
import { useQuery } from '@tanstack/react-query'
import { ApiError, apiClient, type IApiClient } from '@/lib/api'
import {
  computeLeaderboard,
  type LeaderboardEntry,
} from '@/lib/services/leaderboardService'
import type { UserProgress } from '@/types/entities'

const DEFAULT_TOP_N = 5

export const leaderboardQueryKey = (currentUserId: string) =>
  ['leaderboard', currentUserId] as const

export interface LeaderboardView {
  top: LeaderboardEntry[]
  /** המיקום של המשתמש הנוכחי בדירוג המלא — גם אם מחוץ ל-top */
  currentUser: LeaderboardEntry | undefined
}

/** הרכבת הקלט והרצת האגרגציה — מופרד מה-hook כדי להיבדק בלי React */
export async function fetchLeaderboard(
  api: IApiClient,
  currentUserId: string,
  now: Date,
  topN: number = DEFAULT_TOP_N,
): Promise<LeaderboardView> {
  const [members, allEvents, tracks, trackModules, topics, lessons] =
    await Promise.all([
      api.users.findMany(),
      api.userProgress.findMany(),
      api.learningTracks.findMany(),
      api.trackModules.findMany(),
      api.topics.findMany(),
      api.moduleLessons.findMany(),
    ])

  const eventsByUserId = new Map<string, UserProgress[]>()
  for (const e of allEvents) {
    const group = eventsByUserId.get(e.user_id)
    if (group) group.push(e)
    else eventsByUserId.set(e.user_id, [e])
  }

  const ranked = computeLeaderboard({
    members,
    eventsByUserId,
    catalog: { tracks, trackModules, topics, lessons },
    now,
  })

  return {
    top: ranked.slice(0, topN),
    currentUser: ranked.find((entry) => entry.user_id === currentUserId),
  }
}

/** לוח המובילים + מצבי loading/error של react-query */
export function useLeaderboard(
  currentUserId: string | undefined,
  topN: number = DEFAULT_TOP_N,
) {
  return useQuery<LeaderboardView>({
    queryKey: leaderboardQueryKey(currentUserId ?? ''),
    enabled: Boolean(currentUserId),
    queryFn: async () => {
      if (!currentUserId) throw new ApiError('validation', 'חסר מזהה משתמש')
      return fetchLeaderboard(apiClient, currentUserId, new Date(), topN)
    },
  })
}
