/**
 * useActivityFeed — "פעילות אחרונה" בדשבורד האישי (SRS §2.3 getActivityFeed).
 * משתמש באותה הרכבת-קלט של useProgress (fetchProgressInput) ומזין אותה
 * לפונקציה הטהורה deriveActivityFeed — אותו מקור-אמת (UserProgress) כמו שאר
 * הדשבורד, לא ישות/hook נפרדים.
 */
import { useQuery } from '@tanstack/react-query'
import { ApiError, apiClient } from '@/lib/api'
import {
  deriveActivityFeed,
  type ActivityFeedItem,
} from '@/lib/services/activityFeedService'
import { fetchProgressInput } from './useProgress'

const DEFAULT_LIMIT = 5

export const activityFeedQueryKey = (userId: string) =>
  ['activity-feed', userId] as const

export function useActivityFeed(
  userId: string | undefined,
  limit: number = DEFAULT_LIMIT,
) {
  return useQuery<ActivityFeedItem[]>({
    queryKey: activityFeedQueryKey(userId ?? ''),
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) throw new ApiError('validation', 'חסר מזהה משתמש')
      const input = await fetchProgressInput(apiClient, userId, new Date())
      return deriveActivityFeed(input.events, input.catalog, limit)
    },
  })
}
