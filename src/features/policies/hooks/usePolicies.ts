/**
 * גלריית הנהלים: טעינת procedures+users+acknowledgements (react-query) + מצב
 * הפילטרים, והנגזרות (שורות מסוננות, קטגוריות/מחלקות זמינות). ההרכבה והסינון
 * הם פונקציות טהורות ב-services/policyGalleryService.
 */
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import {
  assemblePolicyList,
  availableCategories,
  availableDepartments,
  fetchPolicyGalleryData,
  filterPolicies,
} from '../services/policyGalleryService'
import { EMPTY_POLICY_FILTERS, type PolicyFilters } from '../types'

export const policiesQueryKey = ['policies', 'gallery'] as const

export function usePolicies() {
  const [filters, setFilters] = useState<PolicyFilters>(EMPTY_POLICY_FILTERS)

  const query = useQuery({
    queryKey: policiesQueryKey,
    queryFn: () => fetchPolicyGalleryData(apiClient),
  })

  const items = useMemo(() => {
    if (!query.data) return []
    return assemblePolicyList(
      query.data.procedures,
      query.data.users,
      query.data.acknowledgements,
    )
  }, [query.data])

  const visible = useMemo(
    () => filterPolicies(items, filters),
    [items, filters],
  )
  const categories = useMemo(() => availableCategories(items), [items])
  const departments = useMemo(() => availableDepartments(items), [items])

  const patchFilters = (patch: Partial<PolicyFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch }))

  return {
    isLoading: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
    total: items.length,
    items: visible,
    categories,
    departments,
    filters,
    patchFilters,
    resetFilters: () => setFilters(EMPTY_POLICY_FILTERS),
  }
}
