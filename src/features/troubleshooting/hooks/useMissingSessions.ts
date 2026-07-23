/**
 * לשונית "תסריטים חסרים": שיחות-שירות שבהן לא נמצא Playbook (missing_flow=true).
 * המונה בלשונית סופר את הפערים שטרם טופלו (needsPlaybook — design-export).
 */
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { listMissingSessions } from '../services/troubleshootingService'

export const missingSessionsQueryKey = [
  'troubleshooting-sessions',
  'missing',
] as const

export function useMissingSessions() {
  const query = useQuery({
    queryKey: missingSessionsQueryKey,
    queryFn: () => listMissingSessions(apiClient),
  })

  const sessions = useMemo(() => query.data ?? [], [query.data])

  return {
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    sessions,
    /** פערים שטרם טופלו — מזין את מונה הלשונית (Tag אדום). */
    unhandledCount: sessions.filter((s) => !s.handled).length,
  }
}
