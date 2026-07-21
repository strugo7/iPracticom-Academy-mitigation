/**
 * טעינת ספריית המדיה + מצב-סינון. שכבת react-query היחידה מול apiClient
 * (mediaAssets + users לפתרון שם-המעלה). הסינון/המיון טהורים (mediaSearch)
 * ונגזרים ב-useMemo; הקומפוננטה רק צורכת.
 */
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { MediaAsset } from '@/types/entities'
import {
  filterMedia,
  hasActiveFilters,
  tagOptions,
  topicOptions,
} from '../services/mediaSearch'
import { listMedia } from '../services/mediaService'
import { EMPTY_MEDIA_FILTERS, type MediaAssetView, type MediaFilters } from '../types'

export const mediaQueryKey = ['mediaLibrary', 'assets'] as const
const usersQueryKey = ['mediaLibrary', 'uploaders'] as const

function toView(asset: MediaAsset, names: Map<string, string>): MediaAssetView {
  const usageCount = asset.usage?.length ?? 0
  return {
    asset,
    uploaderName: asset.created_by_id ? (names.get(asset.created_by_id) ?? null) : null,
    usageCount,
    inUse: usageCount > 0,
  }
}

export function useMediaLibrary() {
  const query = useQuery({
    queryKey: mediaQueryKey,
    queryFn: () => listMedia(apiClient),
  })
  // מפת מזהה→שם-מלא לפתרון "מעלה"; נטענת פעם אחת ומאוחסנת ב-cache.
  const usersQuery = useQuery({
    queryKey: usersQueryKey,
    queryFn: () => apiClient.users.findMany(),
    staleTime: 5 * 60_000,
  })

  const [filters, setFilters] = useState<MediaFilters>(EMPTY_MEDIA_FILTERS)

  const names = useMemo(() => {
    const map = new Map<string, string>()
    for (const u of usersQuery.data ?? []) map.set(u.id, u.full_name)
    return map
  }, [usersQuery.data])

  const all = query.data ?? []
  const filtered = useMemo(() => filterMedia(all, filters), [all, filters])
  const views = useMemo(
    () => filtered.map((a) => toView(a, names)),
    [filtered, names],
  )
  const topics = useMemo(() => topicOptions(all), [all])
  const tags = useMemo(() => tagOptions(all), [all])

  return {
    query,
    all,
    filters,
    setFilters,
    resetFilters: () => setFilters(EMPTY_MEDIA_FILTERS),
    views,
    topics,
    tags,
    names,
    total: all.length,
    isFiltering: hasActiveFilters(filters),
  }
}
