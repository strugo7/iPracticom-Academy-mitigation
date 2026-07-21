/**
 * הזמנות-מועמד (Phase 8.1, מסמך 35): רשימה (מסוננת ל-type≠user) + יצירה/
 * שליחה-שוב/ביטול. query אחד לכל ההזמנות — מדגם-ארגון קטן, כמו useInvites.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { Invite } from '@/types/entities'
import {
  cancelCandidateInvite,
  createCandidateInvite,
  resendCandidateInvite,
} from '../services/candidateInviteService'
import { candidateInvites } from '../services/pipelineService'
import type { CandidateInviteDraft } from '../types'

export const candidateInvitesQueryKey = ['recruitment', 'candidateInvites'] as const

export function useCandidateInvites() {
  return useQuery({
    queryKey: candidateInvitesQueryKey,
    queryFn: async () => candidateInvites(await apiClient.invites.findMany()),
  })
}

export function useCandidateInviteMutations() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: candidateInvitesQueryKey })

  const createMutation = useMutation({
    mutationFn: (draft: CandidateInviteDraft) => {
      if (!user) throw new Error('אין משתמש מחובר')
      return createCandidateInvite(apiClient, draft, { id: user.id, email: user.email })
    },
    onSuccess: invalidate,
  })

  const resendMutation = useMutation({
    mutationFn: (invite: Invite) => resendCandidateInvite(apiClient, invite),
    onSuccess: invalidate,
  })

  const cancelMutation = useMutation({
    mutationFn: (inviteId: string) => cancelCandidateInvite(apiClient, inviteId),
    onSuccess: invalidate,
  })

  return {
    create: createMutation.mutateAsync,
    createdInvite: createMutation.data ?? null,
    resetCreate: createMutation.reset,
    resend: resendMutation.mutateAsync,
    cancel: cancelMutation.mutateAsync,
    isCreating: createMutation.isPending,
  }
}
