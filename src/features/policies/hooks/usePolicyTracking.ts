/**
 * מעקב קרא-וחתום לנוהל בודד (react-query). המצליב procedures/users/acks
 * מתבצע ב-services/policyTrackingService (טהור); כאן רק הטעינה והמצב.
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { fetchPolicyTracking } from '../services/policyTrackingService'

export const policyTrackingQueryKey = (procedureId: string) =>
  ['policies', 'tracking', procedureId] as const

export function usePolicyTracking(procedureId: string | null) {
  const query = useQuery({
    queryKey: policyTrackingQueryKey(procedureId ?? ''),
    queryFn: () => fetchPolicyTracking(apiClient, procedureId as string),
    enabled: Boolean(procedureId),
  })

  return {
    isLoading: query.isPending,
    isError: query.isError,
    tracking: query.data ?? null,
    refetch: query.refetch,
  }
}
