/**
 * טעינת הזמנה לפי טוקן (דף-הנחיתה הציבורי, Phase 8.2) + סימולציית consume.
 * ה-consume מבטל-תוקף את שאילתות הגיוס כדי שצינור-המועמדים ישקף את המצב החדש.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { Invite } from '@/types/entities'
import { consumeInvite, findInviteByToken } from '../services/inviteTokenService'

export function useInviteByToken(token: string | undefined) {
  return useQuery({
    queryKey: ['recruitment', 'inviteByToken', token],
    queryFn: () => findInviteByToken(apiClient, token ?? ''),
    enabled: Boolean(token),
  })
}

export function useConsumeInvite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (invite: Invite) => consumeInvite(apiClient, invite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment'] })
    },
  })
}
