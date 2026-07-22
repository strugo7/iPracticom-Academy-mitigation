/**
 * מחיקת נוהל (soft, מתועד) — mutation שקורא ל-softDeleteProcedure עם המשתמש
 * הנוכחי והסיבה, ומבטל את cache הגלריה כדי שהנוהל ייעלם מיד.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { softDeleteProcedure } from '../services/policyDeleteService'
import { policiesQueryKey } from './usePolicies'

export function useDeletePolicy() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      procedureId,
      reason,
    }: {
      procedureId: string
      reason: string
    }) => {
      if (!user) throw new Error('no user')
      return softDeleteProcedure(apiClient, procedureId, user, reason)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policiesQueryKey })
    },
  })
}
