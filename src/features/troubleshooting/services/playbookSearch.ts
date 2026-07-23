/**
 * סינון ומיון ספריית ה-Playbooks — פונקציות טהורות (אין react, אין API), כדי
 * שהלוגיקה תיבדק בלי UI. משקף את design-export/Troubleshooting.dc.html: חיפוש
 * חופשי על כותרת+תיאור+תגיות, פילטרים מצטברים (קטגוריה/קושי/תגית), ומיון.
 */
import type { TroubleshootingFlow } from '@/types/entities'
import type { FilterOption, PlaybookFilters, PlaybookSort } from '../types'

/** כל המילים שה-Playbook נמצא לפיהן בחיפוש חופשי. */
function haystack(flow: TroubleshootingFlow): string {
  return [flow.title, flow.description, flow.category, ...(flow.tags ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function matchesFilters(
  flow: TroubleshootingFlow,
  filters: PlaybookFilters,
): boolean {
  if (filters.category && flow.category !== filters.category) return false
  if (filters.difficulty && flow.difficulty_level !== filters.difficulty) {
    return false
  }
  if (
    filters.tag &&
    !(flow.tags ?? []).some(
      (t) => t.toLowerCase() === filters.tag?.toLowerCase(),
    )
  ) {
    return false
  }
  const q = filters.search.trim().toLowerCase()
  if (q && !haystack(flow).includes(q)) return false
  return true
}

function sortPlaybooks(
  flows: TroubleshootingFlow[],
  sort: PlaybookSort,
): TroubleshootingFlow[] {
  const sorted = [...flows]
  if (sort === 'usage') {
    sorted.sort((a, b) => (b.usage_count ?? 0) - (a.usage_count ?? 0))
  } else if (sort === 'success') {
    sorted.sort((a, b) => (b.success_rate ?? 0) - (a.success_rate ?? 0))
  } else {
    // 'recent' — לפי created_date יורד (כבר ממוין מה-service, שומרים יציבות).
    sorted.sort((a, b) =>
      (b.created_date ?? '').localeCompare(a.created_date ?? ''),
    )
  }
  return sorted
}

export function filterPlaybooks(
  flows: TroubleshootingFlow[],
  filters: PlaybookFilters,
): TroubleshootingFlow[] {
  return sortPlaybooks(
    flows.filter((flow) => matchesFilters(flow, filters)),
    filters.sort,
  )
}

/** ערכים ייחודיים של שדה-מחרוזת יחיד, ממוינים א-ב (עברית). */
function uniqueOptions(values: (string | null | undefined)[]): FilterOption[] {
  const set = new Set<string>()
  for (const value of values) {
    if (value) set.add(value)
  }
  return [...set]
    .sort((a, b) => a.localeCompare(b, 'he'))
    .map((value) => ({ value, label: value }))
}

/** אפשרויות הבוררים — נגזרות מהדאטה בפועל, כדי שלא יוצג פילטר ריק. */
export function categoryOptions(flows: TroubleshootingFlow[]): FilterOption[] {
  return uniqueOptions(flows.map((f) => f.category))
}

export function difficultyOptions(
  flows: TroubleshootingFlow[],
): FilterOption[] {
  return uniqueOptions(flows.map((f) => f.difficulty_level))
}

export function tagOptions(flows: TroubleshootingFlow[]): FilterOption[] {
  return uniqueOptions(flows.flatMap((f) => f.tags ?? []))
}

/** האם פילטר כלשהו פעיל (מיון אינו פילטר) — קובע את הצגת מצב "אין תוצאות". */
export function isFiltering(filters: PlaybookFilters): boolean {
  return Boolean(
    filters.search.trim() ||
    filters.category ||
    filters.difficulty ||
    filters.tag,
  )
}
