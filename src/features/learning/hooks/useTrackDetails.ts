/**
 * useTrackDetails — עץ תוכן המסלול (TrackDetails, doc 04). שולף את המסלול +
 * הקטלוג המלא (כמו fetchProgressInput — בלי סינון-שרת יחסי, אותו דפוס
 * Phase 1) + אירועי ה-UserProgress של המשתמש, ומזין את assembleTrackDetails.
 */
import { useQuery } from '@tanstack/react-query'
import { ApiError, apiClient, type IApiClient } from '@/lib/api'
import type { UserProgress } from '@/types/entities'
import {
  assembleTrackDetails,
  type TrackDetailsCatalog,
} from '../services/trackDetailsService'
import type { TrackDetailsViewModel } from '../types'

export const trackDetailsQueryKey = (trackId: string, userId: string) =>
  ['track-details', trackId, userId] as const

export async function fetchTrackDetailsInput(
  api: IApiClient,
  trackId: string,
  userId: string,
): Promise<{
  track: Awaited<ReturnType<IApiClient['learningTracks']['findById']>>
  catalog: TrackDetailsCatalog
  events: UserProgress[]
}> {
  const [track, trackModules, sharedModules, topics, lessons, exams, events] =
    await Promise.all([
      api.learningTracks.findById(trackId),
      api.trackModules.findMany({ filter: { track_id: trackId } }),
      api.sharedModules.findMany(),
      api.topics.findMany(),
      api.moduleLessons.findMany(),
      api.exams.findMany(),
      api.userProgress.findMany({ filter: { user_id: userId } }),
    ])
  if (!track) {
    throw new ApiError('not_found', `מסלול ${trackId} לא נמצא`)
  }
  return {
    track,
    catalog: { trackModules, sharedModules, topics, lessons, exams },
    events,
  }
}

export function useTrackDetails(
  trackId: string | undefined,
  userId: string | undefined,
) {
  return useQuery<TrackDetailsViewModel>({
    queryKey: trackDetailsQueryKey(trackId ?? '', userId ?? ''),
    enabled: Boolean(trackId) && Boolean(userId),
    queryFn: async () => {
      const input = await fetchTrackDetailsInput(
        apiClient,
        trackId as string,
        userId as string,
      )
      return assembleTrackDetails(
        input.track as NonNullable<typeof input.track>,
        input.catalog,
        input.events,
      )
    },
  })
}
