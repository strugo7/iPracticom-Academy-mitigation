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

/** ערך ה-category של מסלולים גלויים לכל המחלקות (SRS §מחלקות, שורה 17). */
const COMPANY_WIDE_CATEGORY = 'כלל החברה'

export async function fetchTrackDetailsInput(
  api: IApiClient,
  trackId: string,
  userId: string,
): Promise<{
  track: Awaited<ReturnType<IApiClient['learningTracks']['findById']>>
  catalog: TrackDetailsCatalog
  events: UserProgress[]
}> {
  const [
    track,
    trackModules,
    sharedModules,
    topics,
    lessons,
    exams,
    events,
    user,
  ] = await Promise.all([
    api.learningTracks.findById(trackId),
    api.trackModules.findMany({ filter: { track_id: trackId } }),
    api.sharedModules.findMany(),
    api.topics.findMany(),
    api.moduleLessons.findMany(),
    api.exams.findMany(),
    api.userProgress.findMany({ filter: { user_id: userId } }),
    api.users.findById(userId),
  ])
  if (!track) {
    throw new ApiError('not_found', `מסלול ${trackId} לא נמצא`)
  }
  if (!user) {
    throw new ApiError('not_found', `משתמש ${userId} לא נמצא`)
  }
  if (
    track.category !== user.department &&
    track.category !== COMPANY_WIDE_CATEGORY
  ) {
    // התאמת מחלקה כושלת מתייחסת כאילו המסלול לא קיים — לא חושפים
    // שהמסלול קיים אך שייך למחלקה אחרת (ראו PRD "not-found state").
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
