/** שם המסלול המוקצה למשתמש — עבור כרטיס ה-Hero (assigned_track_id → LearningTrack.title). */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { LearningTrack } from '@/types/entities'

export function useAssignedTrack(trackId: string | null | undefined) {
  return useQuery<LearningTrack | null>({
    queryKey: ['learning-track', trackId ?? ''],
    enabled: Boolean(trackId),
    queryFn: () => apiClient.learningTracks.findById(trackId as string),
  })
}
