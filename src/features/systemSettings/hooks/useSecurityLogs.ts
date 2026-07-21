/** יומני-אבטחה (SecurityLog) — נכתבים אמיתית ע"י mockAuthProvider בכל login. */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export const securityLogsQueryKey = ['systemSettings', 'securityLogs'] as const

export function useSecurityLogs() {
  return useQuery({
    queryKey: securityLogsQueryKey,
    queryFn: () => apiClient.securityLogs.findMany(),
  })
}
