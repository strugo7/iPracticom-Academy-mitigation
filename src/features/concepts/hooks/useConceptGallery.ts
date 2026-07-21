/**
 * גלריית המונחים: טעינת המאגר (react-query) + מצב הפילטרים, והנגזרות שלהם.
 * הסינון/המיון עצמם הם פונקציות טהורות ב-services/conceptSearch.
 */
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import {
  categoryChips,
  filterConcepts,
  isFiltering,
} from '../services/conceptSearch'
import { listConcepts } from '../services/conceptService'
import { type ConceptFilters, EMPTY_FILTERS } from '../types'

export const conceptsQueryKey = ['concepts'] as const

export function useConceptGallery() {
  const [filters, setFilters] = useState<ConceptFilters>(EMPTY_FILTERS)

  const query = useQuery({
    queryKey: conceptsQueryKey,
    queryFn: () => listConcepts(apiClient),
  })

  const concepts = useMemo(() => query.data ?? [], [query.data])
  const visible = useMemo(
    () => filterConcepts(concepts, filters),
    [concepts, filters],
  )
  const chips = useMemo(
    () => categoryChips(concepts, filters),
    [concepts, filters],
  )

  const patchFilters = (patch: Partial<ConceptFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch }))

  return {
    isLoading: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
    total: concepts.length,
    concepts: visible,
    chips,
    filters,
    patchFilters,
    resetFilters: () => setFilters(EMPTY_FILTERS),
    isFiltering: isFiltering(filters),
  }
}
