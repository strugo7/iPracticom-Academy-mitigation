/**
 * סינון, מיון ואיסוף-פילטרים לספריית המדיה — לוגיקה טהורה (נבדקת ב-
 * mediaSearch.test). הקומפוננטות אינן מסננות בעצמן; הכל נגזר כאן.
 */
import type { MediaAsset } from '@/types/entities'
import type { MediaFilters, MediaSort } from '../types'

const usageCount = (a: MediaAsset): number => a.usage?.length ?? 0

/** האם הנכס תואם את מחרוזת-החיפוש (שם / תגית / נושא). */
function matchesSearch(asset: MediaAsset, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (asset.title.toLowerCase().includes(q)) return true
  if (asset.topic?.toLowerCase().includes(q)) return true
  return (asset.tags ?? []).some((t) => t.toLowerCase().includes(q))
}

function comparator(sort: MediaSort): (a: MediaAsset, b: MediaAsset) => number {
  switch (sort) {
    case 'most-used':
      return (a, b) => usageCount(b) - usageCount(a)
    case 'topic':
      return (a, b) => (a.topic ?? '').localeCompare(b.topic ?? '', 'he')
    default: // 'recent'
      return (a, b) => (b.created_date ?? '').localeCompare(a.created_date ?? '')
  }
}

/** מחזיר את הנכסים לאחר סינון (חיפוש/סוג/שימוש/נושא/תגית) ומיון. */
export function filterMedia(
  assets: MediaAsset[],
  filters: MediaFilters,
): MediaAsset[] {
  const result = assets.filter((a) => {
    if (!matchesSearch(a, filters.search)) return false
    if (filters.type !== 'all' && a.file_type !== filters.type) return false
    if (filters.usage === 'used' && usageCount(a) === 0) return false
    if (filters.usage === 'unused' && usageCount(a) > 0) return false
    if (filters.topic && a.topic !== filters.topic) return false
    if (filters.tag && !(a.tags ?? []).includes(filters.tag)) return false
    return true
  })
  return result.sort(comparator(filters.sort))
}

/** האם קיים סינון פעיל (מעבר למיון בלבד). */
export function hasActiveFilters(filters: MediaFilters): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.type !== 'all' ||
    filters.usage !== 'all' ||
    filters.topic !== null ||
    filters.tag !== null
  )
}

/** ספירת נכסים לכל סוג-קובץ (לתגי-הסינון: "תמונה 4"). */
export function countByType(assets: MediaAsset[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const a of assets) {
    if (a.file_type) counts[a.file_type] = (counts[a.file_type] ?? 0) + 1
  }
  return counts
}

/** רשימת הנושאים הייחודיים (לתפריט הסינון "נושא"), ממוינת. */
export function topicOptions(assets: MediaAsset[]): string[] {
  const set = new Set<string>()
  for (const a of assets) if (a.topic) set.add(a.topic)
  return [...set].sort((x, y) => x.localeCompare(y, 'he'))
}

/** רשימת התגיות הייחודיות (לתפריט הסינון "תגיות"), ממוינת. */
export function tagOptions(assets: MediaAsset[]): string[] {
  const set = new Set<string>()
  for (const a of assets) for (const t of a.tags ?? []) set.add(t)
  return [...set].sort((x, y) => x.localeCompare(y, 'he'))
}
