/**
 * הערכות מבחן-כניסה של מועמדים (Phase 8.3, מסמך 35): רשימה (מהחדשה לישנה) +
 * מוטציית החלטת-מנהל. מבטל-תוקף גם את הזמנות-המועמד — החלטת-אישור מסמנת הזמנה
 * כ-'hired' (ראו candidateDecisionService).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { EvaluationDecision } from '@/lib/constants/enums'
import type { CandidateAssessment } from '@/types/entities'
import { makeCandidateDecision } from '../services/candidateDecisionService'
import { candidateInvitesQueryKey } from './useCandidateInvites'

export const candidateAssessmentsQueryKey = ['recruitment', 'assessments'] as const

export function useCandidateAssessments() {
  return useQuery({
    queryKey: candidateAssessmentsQueryKey,
    queryFn: async () => {
      const list = await apiClient.candidateAssessments.findMany()
      return [...list].sort(
        (a, b) => Date.parse(b.submitted_at) - Date.parse(a.submitted_at),
      )
    },
  })
}

export interface DecisionInput {
  assessment: CandidateAssessment
  decision: EvaluationDecision
  notes: string
}

export function useCandidateDecisionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assessment, decision, notes }: DecisionInput) =>
      makeCandidateDecision(apiClient, assessment, decision, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateAssessmentsQueryKey })
      queryClient.invalidateQueries({ queryKey: candidateInvitesQueryKey })
    },
  })
}
