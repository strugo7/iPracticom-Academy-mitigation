/**
 * מבחן-הכניסה של מועמד (Phase 8.2): שליפת המבחן+שאלות לפי ההזמנה, והגשה.
 * ההגשה מבטלת-תוקף את שאילתות הגיוס — ההערכה החדשה מופיעה בטאב ההערכות.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { Invite } from '@/types/entities'
import {
  fetchExamForCandidate,
  submitCandidateAssessment,
  type CandidateExamSubmission,
} from '../services/candidateExamService'

export function useCandidateExam(invite: Invite | null) {
  return useQuery({
    queryKey: ['recruitment', 'candidateExam', invite?.id],
    queryFn: () => fetchExamForCandidate(apiClient, invite as Invite),
    enabled: Boolean(invite?.exam_id),
  })
}

export function useSubmitCandidateAssessment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (submission: CandidateExamSubmission) =>
      submitCandidateAssessment(apiClient, submission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment'] })
    },
  })
}
