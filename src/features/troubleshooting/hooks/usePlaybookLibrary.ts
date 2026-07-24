/**
 * לשונית "ספריית Playbooks": טעינת הקטלוג (react-query) + מצב הפילטרים והנגזרות.
 * הסינון/המיון עצמם הם פונקציות טהורות ב-services/playbookSearch.
 */
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import {
  categoryOptions,
  difficultyOptions,
  filterPlaybooks,
  isFiltering,
  tagOptions,
} from '../services/playbookSearch'
import { listPlaybooks } from '../services/troubleshootingService'
import { EMPTY_FILTERS, type PlaybookFilters } from '../types'

export const playbooksQueryKey = ['troubleshooting-flows'] as const

export function usePlaybookLibrary() {
  const [filters, setFilters] = useState<PlaybookFilters>(EMPTY_FILTERS)

  const query = useQuery({
    queryKey: playbooksQueryKey,
    queryFn: () => listPlaybooks(apiClient),
  })

  const flows = useMemo(() => query.data ?? [], [query.data])
  const visible = useMemo(
    () => filterPlaybooks(flows, filters),
    [flows, filters],
  )

  const patchFilters = (patch: Partial<PlaybookFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch }))

  return {
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    total: flows.length,
    playbooks: visible,
    filters,
    patchFilters,
    resetFilters: () => setFilters(EMPTY_FILTERS),
    isFiltering: isFiltering(filters),
    categoryOptions: useMemo(() => categoryOptions(flows), [flows]),
    difficultyOptions: useMemo(() => difficultyOptions(flows), [flows]),
    tagOptions: useMemo(() => tagOptions(flows), [flows]),
  }
}
