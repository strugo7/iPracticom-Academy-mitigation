/**
 * useTrackCatalog — הקטלוג האישי (TracksCatalog, doc 03). מרכיב את המסלולים +
 * את ה-user (ל-assigned_track_id) במקביל ל-useProgress (Phase 1, ה-stats),
 * ומזין את assembleTrackCatalog. לא ניגש ל-progress_stats בעצמו.
 */
import { useQuery } from '@tanstack/react-query'
import { ApiError, apiClient, type IApiClient } from '@/lib/api'
import { useProgress } from '@/lib/hooks/useProgress'
import { assembleTrackCatalog } from '../services/trackCatalogService'
import type { TrackCatalogItem } from '../types'

export const trackCatalogQueryKey = (userId: string) =>
  ['track-catalog', userId] as const

/** שליפת המשתמש (ל-assigned_track_id) + כל המסלולים — מופרד מה-hook כדי להיבדק בלי React */
export async function fetchTrackCatalogTracks(api: IApiClient, userId: string) {
  const [user, tracks] = await Promise.all([
    api.users.findById(userId),
    api.learningTracks.findMany(),
  ])
  if (!user) {
    throw new ApiError('not_found', `משתמש ${userId} לא נמצא`)
  }
  return { assignedTrackId: user.assigned_track_id ?? null, tracks }
}

export function useTrackCatalog(userId: string | undefined) {
  const progress = useProgress(userId)
  const tracksQuery = useQuery({
    queryKey: trackCatalogQueryKey(userId ?? ''),
    enabled: Boolean(userId),
    queryFn: () => fetchTrackCatalogTracks(apiClient, userId as string),
  })

  const items: TrackCatalogItem[] =
    tracksQuery.data && progress.data
      ? assembleTrackCatalog(
          tracksQuery.data.tracks,
          { assigned_track_id: tracksQuery.data.assignedTrackId },
          progress.data.stats,
        )
      : []

  return {
    items,
    isLoading: progress.isLoading || tracksQuery.isLoading,
    isError: progress.isError || tracksQuery.isError,
    error: progress.error ?? tracksQuery.error,
  }
}
