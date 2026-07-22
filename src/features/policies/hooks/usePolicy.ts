/**
 * טעינת נוהל בודד לצפייה (react-query). RLS: read `{}` — כל מאומת. הנגזרות
 * (TOC, זמן-קריאה) מחושבות בקומפוננטה מ-policyViewerService.
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export const policyQueryKey = (procedureId: string) =>
  ['policies', 'detail', procedureId] as const

export function usePolicy(procedureId: string | undefined) {
  const query = useQuery({
    queryKey: policyQueryKey(procedureId ?? ''),
    queryFn: () => apiClient.procedures.findById(procedureId as string),
    enabled: Boolean(procedureId),
  })

  return {
    isLoading: query.isPending,
    isError: query.isError,
    notFound: query.isSuccess && query.data === null,
    procedure: query.data ?? null,
    refetch: query.refetch,
  }
}
