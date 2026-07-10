/**
 * useTrackCatalog — הקטלוג האישי (TracksCatalog, doc 03). מרכיב בדיוק את
 * אותו view-model של trackDetailsService עבור המסלול המוקצה למשתמש (כדי
 * שהאחוז/המונה יהיו זהים לדף התוכן של אותו מסלול — ראו trackCatalogService.ts).
 */
import { useQuery } from '@tanstack/react-query'
import { ApiError, apiClient, type IApiClient } from '@/lib/api'
import { assembleTrackDetails } from '../services/trackDetailsService'
import { assembleTrackCatalog } from '../services/trackCatalogService'
import type { TrackCatalogItem } from '../types'
import { fetchTrackDetailsInput } from './useTrackDetails'

export const trackCatalogQueryKey = (userId: string) =>
  ['track-catalog', userId] as const

/** שליפת קלט הקטלוג — מופרד מה-hook כדי להיבדק בלי React. null כשאין מסלול מוקצה. */
export async function fetchTrackCatalogInput(api: IApiClient, userId: string) {
  const user = await api.users.findById(userId)
  if (!user) {
    throw new ApiError('not_found', `משתמש ${userId} לא נמצא`)
  }
  if (!user.assigned_track_id) return null
  return fetchTrackDetailsInput(api, user.assigned_track_id, userId)
}

export function useTrackCatalog(userId: string | undefined) {
  const query = useQuery<TrackCatalogItem[]>({
    queryKey: trackCatalogQueryKey(userId ?? ''),
    enabled: Boolean(userId),
    queryFn: async () => {
      const input = await fetchTrackCatalogInput(apiClient, userId as string)
      if (!input) return []
      const details = assembleTrackDetails(
        input.track as NonNullable<typeof input.track>,
        input.catalog,
        input.events,
      )
      return assembleTrackCatalog(details)
    },
  })

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
