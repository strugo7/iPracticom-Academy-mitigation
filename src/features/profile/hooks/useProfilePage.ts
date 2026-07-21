/**
 * useProfilePage — שולף את קלט דף הפרופיל (user, מסלול משויך, קטלוג מבחנים
 * ושאלות, וניסיונות-המבחן של המשתמש) ומרכיב ProfileViewModel דרך
 * profileService. ה-stats/insights עצמם לא מחושבים כאן — נצרכים מ-useProgress
 * הקיים (PROGRESS_ENGINE.md §1: "אף מסך לא מחשב התקדמות לבד").
 */
import { useQuery } from '@tanstack/react-query'
import { ApiError, apiClient, type IApiClient } from '@/lib/api'
import { useProgress } from '@/lib/hooks/useProgress'
import type {
  Exam,
  ExamAttempt,
  LearningTrack,
  Question,
  User,
} from '@/types/entities'
import { assembleProfileViewModel } from '../services/profileService'
import type { ProfileViewModel } from '../types'

export const profilePageQueryKey = (userId: string) =>
  ['profile-page', userId] as const

interface ProfilePageInput {
  user: User
  track: LearningTrack | null
  attempts: ExamAttempt[]
  exams: Exam[]
  questions: Question[]
}

export async function fetchProfilePageInput(
  api: IApiClient,
  userId: string,
): Promise<ProfilePageInput> {
  const [user, attempts, exams, questions] = await Promise.all([
    api.users.findById(userId),
    api.examAttempts.findMany({ filter: { user_id: userId } }),
    api.exams.findMany(),
    api.questions.findMany(),
  ])
  if (!user) {
    throw new ApiError('not_found', `משתמש ${userId} לא נמצא`)
  }
  const track = user.assigned_track_id
    ? await api.learningTracks.findById(user.assigned_track_id)
    : null
  return { user, track, attempts, exams, questions }
}

function useProfilePageInput(userId: string | undefined) {
  return useQuery<ProfilePageInput>({
    queryKey: profilePageQueryKey(userId ?? ''),
    enabled: Boolean(userId),
    queryFn: () => fetchProfilePageInput(apiClient, userId as string),
  })
}

export interface UseProfilePageResult {
  data: ProfileViewModel | undefined
  isLoading: boolean
  isError: boolean
  error: unknown
}

/** משלב את קלט הדף עם useProgress (Phase 1) לכדי ProfileViewModel אחד. */
export function useProfilePage(userId: string | undefined): UseProfilePageResult {
  const pageQuery = useProfilePageInput(userId)
  const progressQuery = useProgress(userId)

  const data =
    pageQuery.data && progressQuery.data
      ? assembleProfileViewModel({
          user: pageQuery.data.user,
          track: pageQuery.data.track,
          progress: progressQuery.data,
          attempts: pageQuery.data.attempts,
          exams: pageQuery.data.exams,
          questions: pageQuery.data.questions,
        })
      : undefined

  return {
    data,
    isLoading: pageQuery.isLoading || progressQuery.isLoading,
    isError: pageQuery.isError || progressQuery.isError,
    error: pageQuery.error ?? progressQuery.error,
  }
}
