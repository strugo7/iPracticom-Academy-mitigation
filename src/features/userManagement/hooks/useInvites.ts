/**
 * הזמנות-משתמש (מסמך 26): רשימה + יצירה/שליחה-שוב/ביטול. query אחד (כל
 * ההזמנות) מסונן ל-department בקומפוננטה — מדגם-ארגון קטן, כמו useDirectoryUsers.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import {
  cancelInvite,
  createInvite,
  type CreateInviteInput,
  resendInvite,
} from '../services/inviteService'
import type { Invite } from '@/types/entities'

export const invitesQueryKey = ['userManagement', 'invites'] as const

export function useInvites() {
  return useQuery({
    queryKey: invitesQueryKey,
    queryFn: () => apiClient.invites.findMany(),
  })
}

export function useInviteMutations() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: invitesQueryKey })

  const createMutation = useMutation({
    mutationFn: (input: CreateInviteInput) => {
      if (!user) throw new Error('אין משתמש מחובר')
      return createInvite(apiClient, input, { id: user.id, email: user.email })
    },
    onSuccess: invalidate,
  })

  const resendMutation = useMutation({
    mutationFn: (invite: Invite) => resendInvite(apiClient, invite),
    onSuccess: invalidate,
  })

  const cancelMutation = useMutation({
    mutationFn: (inviteId: string) => cancelInvite(apiClient, inviteId),
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
