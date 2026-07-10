/**
 * useProgress — ה-hook היחיד שמסכים צורכים ממנו התקדמות אישית
 * (PROGRESS_ENGINE.md §1). אוסף את הקלט מ-apiClient, מזין את
 * recalculateUserStats (הפונקציה היחידה שמחשבת) ואת deriveProgressInsights
 * (מדדי-התצוגה §10), ומחזיר הכל דרך react-query. אף קומפוננטה לא מחשבת לבד.
 *
 * invalidation: אחרי יצירת אירוע UserProgress יש לבטל את progressQueryKey(userId)
 * — כך ה-stats "מתעדכן" בלי שום increment ידני.
 */
import { useQuery } from '@tanstack/react-query'
import { ApiError, apiClient, type IApiClient } from '@/lib/api'
import {
  deriveProgressInsights,
  type InsightsInput,
  type ProgressInsights,
} from '@/lib/services/progressInsights'
import {
  recalculateUserStats,
  type ProgressResult,
} from '@/lib/services/progressService'

export const progressQueryKey = (userId: string) =>
  ['progress', userId] as const

/** הפלט המלא לצריכת המסכים: ה-stats הנשמר + מדדי התצוגה */
export type UserProgressView = ProgressResult & { insights: ProgressInsights }

/**
 * הרכבת הקלט למנוע ולמדדים — user, כל אירועי המשתמש, והקטלוג העדכני כולל
 * המבחנים (המכנים נגזרים ממנו בכל חישוב, בלי snapshot). מופרד מה-hook
 * כדי להיבדק בלי React.
 */
export async function fetchProgressInput(
  api: IApiClient,
  userId: string,
  now: Date,
): Promise<InsightsInput> {
  const [user, events, tracks, trackModules, topics, lessons, exams] =
    await Promise.all([
      api.users.findById(userId),
      api.userProgress.findMany({ filter: { user_id: userId } }),
      api.learningTracks.findMany(),
      api.trackModules.findMany(),
      api.topics.findMany(),
      api.moduleLessons.findMany(),
      api.exams.findMany(),
    ])
  if (!user) {
    throw new ApiError('not_found', `משתמש ${userId} לא נמצא`)
  }
  return {
    user: { id: user.id, department: user.department ?? null },
    events,
    catalog: { tracks, trackModules, topics, lessons, exams },
    // UserCertificate לא קיים ב-19 ישויות הגיבוי — יחווט בשלב התעודות
    certificatesCount: 0,
    now,
  }
}

/** חישוב מלא מקלט מורכב — משותף ל-hook האישי ולאגרגציה המחלקתית */
export function computeUserProgressView(
  input: InsightsInput,
): UserProgressView {
  const result = recalculateUserStats(input)
  return { ...result, insights: deriveProgressInsights(input, result.stats) }
}

/** stats+insights מחושבים + מצבי loading/error של react-query. */
export function useProgress(userId: string | undefined) {
  return useQuery<UserProgressView>({
    queryKey: progressQueryKey(userId ?? ''),
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) throw new ApiError('validation', 'חסר מזהה משתמש')
      const input = await fetchProgressInput(apiClient, userId, new Date())
      return computeUserProgressView(input)
    },
  })
}
