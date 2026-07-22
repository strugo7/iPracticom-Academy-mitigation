/**
 * מצב פח-האשפה: טעינת הפריטים המחוקים (react-query), סינון-לפי-סוג, ופעולות
 * שחזור/מחיקה-לצמיתות. שחזור/purge מבטלים את כל ה-cache כדי שגם גלריות-המקור
 * (נהלים/מונחים/שיעורים) יתעדכנו — פעולת-אדמין נדירה, עלות ההרחבה זניחה.
 */
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import {
  listDeleted,
  purgeItem,
  restoreItem,
} from '../services/recycleBinService'
import type { DeletedItem, TrashEntityType, TrashFilter } from '../types'

export const recycleBinQueryKey = ['recycle-bin'] as const

export function useRecycleBin() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<TrashFilter>('all')

  const query = useQuery({
    queryKey: recycleBinQueryKey,
    queryFn: () => listDeleted(apiClient),
  })

  const items = useMemo(() => query.data ?? [], [query.data])
  const visible = useMemo(
    () =>
      filter === 'all' ? items : items.filter((i) => i.entityType === filter),
    [items, filter],
  )

  const counts = useMemo(() => {
    const by: Record<TrashEntityType, number> = {
      procedure: 0,
      lesson: 0,
      concept: 0,
      flow: 0,
    }
    for (const item of items) by[item.entityType] += 1
    return by
  }, [items])

  const invalidateAll = () => queryClient.invalidateQueries()

  const restore = useMutation({
    mutationFn: (item: DeletedItem) => restoreItem(apiClient, item),
    onSuccess: invalidateAll,
  })

  const purge = useMutation({
    mutationFn: (item: DeletedItem) => purgeItem(apiClient, item),
    onSuccess: invalidateAll,
  })

  return {
    isLoading: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
    total: items.length,
    items: visible,
    counts,
    filter,
    setFilter,
    restore,
    purge,
  }
}
