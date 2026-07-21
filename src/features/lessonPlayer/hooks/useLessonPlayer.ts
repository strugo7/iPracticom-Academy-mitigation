/**
 * useLessonPlayer — קלט נגן-השיעור (שיעור + מבחן מקושר). מראה את useTrackDetails.
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import {
  fetchLessonPlayerInput,
  type LessonPlayerInput,
} from '../services/lessonPlayerService'

export const lessonPlayerQueryKey = (lessonId: string) =>
  ['lesson-player', lessonId] as const

export function useLessonPlayer(lessonId: string | undefined) {
  return useQuery<LessonPlayerInput>({
    queryKey: lessonPlayerQueryKey(lessonId ?? ''),
    enabled: Boolean(lessonId),
    queryFn: () => fetchLessonPlayerInput(apiClient, lessonId as string),
  })
}
