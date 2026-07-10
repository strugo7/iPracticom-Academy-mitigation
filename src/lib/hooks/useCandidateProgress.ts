/**
 * useCandidateProgress — מעקב ציוני מבחני-כניסה של מועמדים
 * (PROGRESS_ENGINE.md §11), לדשבורד המנהלים ולמסכי הגיוס.
 * שולף את כל ההערכות ומסכם דרך summarizeCandidateAssessments — בכוונה
 * נפרד ממנוע ההתקדמות של עובדים.
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient, type IApiClient } from '@/lib/api'
import {
  summarizeCandidateAssessments,
  type CandidateTracking,
} from '@/lib/services/candidateProgressService'

export const candidateTrackingQueryKey = ['candidate-tracking'] as const

/** שליפה + סיכום — מופרד מה-hook כדי להיבדק בלי React */
export async function fetchCandidateTracking(
  api: IApiClient,
): Promise<CandidateTracking> {
  const assessments = await api.candidateAssessments.findMany()
  return summarizeCandidateAssessments(assessments)
}

export function useCandidateProgress() {
  return useQuery<CandidateTracking>({
    queryKey: candidateTrackingQueryKey,
    queryFn: () => fetchCandidateTracking(apiClient),
  })
}
