/**
 * מצב החתימה של המשתמש הנוכחי על נוהל + פעולת החתימה (react-query mutation).
 * ה-mutation מבטל את ה-cache של החתימה, של המעקב ושל הגלריה — כדי שמד-המילוי
 * והמעקב יתעדכנו מיד אחרי חתימה.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import {
  acknowledgeProcedure,
  findUserAcknowledgement,
} from '../services/policyAcknowledgeService'
import { policiesQueryKey } from './usePolicies'
import { policyTrackingQueryKey } from './usePolicyTracking'

export const policyAckQueryKey = (procedureId: string, userId: string) =>
  ['policies', 'acknowledgement', procedureId, userId] as const

export function usePolicyAcknowledgement(procedureId: string | undefined) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.id ?? ''

  const query = useQuery({
    queryKey: policyAckQueryKey(procedureId ?? '', userId),
    queryFn: () =>
      findUserAcknowledgement(apiClient, procedureId as string, userId),
    enabled: Boolean(procedureId && userId),
  })

  const sign = useMutation({
    mutationFn: () => {
      if (!procedureId || !user) {
        throw new Error('missing procedure or user')
      }
      return acknowledgeProcedure(apiClient, procedureId, user)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: policyAckQueryKey(procedureId ?? '', userId),
      })
      queryClient.invalidateQueries({
        queryKey: policyTrackingQueryKey(procedureId ?? ''),
      })
      queryClient.invalidateQueries({ queryKey: policiesQueryKey })
    },
  })

  return {
    isLoading: query.isPending,
    acknowledgement: query.data ?? null,
    isSigned: Boolean(query.data),
    sign,
  }
}
