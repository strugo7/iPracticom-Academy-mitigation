/**
 * סינון ומיון הגלריה — פונקציות טהורות (אין react, אין API), כדי שהלוגיקה
 * תיבדק בלי UI. הלוגיקה משקפת את `renderVals()` ב-design-export/Concepts.dc.html:
 * חיפוש חופשי על מונח+תיאור+תגיות+נרדפות, פילטרים מצטברים, ומיון א-ב/נצפה.
 */
import type { Concept } from '@/types/entities'
import type { CategoryChip, ConceptFilters, ConceptSort } from '../types'

/** כל המילים שהמונח נמצא לפיהן בחיפוש חופשי. */
function haystack(concept: Concept): string {
  return [
    concept.term,
    concept.short_description,
    ...(concept.related_terms ?? []),
    ...(concept.synonyms ?? []),
  ]
    .join(' ')
    .toLowerCase()
}

/** תגית = related_terms ∪ synonyms (הבריף: "תגיות (related_terms/synonyms)"). */
function tagPool(concept: Concept): string[] {
  return [...(concept.related_terms ?? []), ...(concept.synonyms ?? [])].map((t) =>
    t.toLowerCase(),
  )
}

/** כל הפילטרים **חוץ** מקטגוריה — הבסיס למוני-השבבים (כמו baseForCount בעיצוב). */
function matchesExceptCategory(concept: Concept, filters: ConceptFilters): boolean {
  if (filters.difficulty && concept.difficulty_level !== filters.difficulty) {
    return false
  }
  if (filters.status && concept.status !== filters.status) return false
  if (filters.tag && !tagPool(concept).includes(filters.tag.toLowerCase())) {
    return false
  }
  const q = filters.search.trim().toLowerCase()
  if (q && !haystack(concept).includes(q)) return false
  return true
}

function sortConcepts(concepts: Concept[], sort: ConceptSort): Concept[] {
  const sorted = [...concepts]
  if (sort === 'views') {
    sorted.sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))
  } else {
    sorted.sort((a, b) => a.term.localeCompare(b.term, 'he'))
  }
  return sorted
}

export function filterConcepts(
  concepts: Concept[],
  filters: ConceptFilters,
): Concept[] {
  const matched = concepts.filter(
    (c) =>
      matchesExceptCategory(c, filters) &&
      (!filters.category || c.category === filters.category),
  )
  return sortConcepts(matched, filters.sort)
}

/**
 * שבבי-הקטגוריה: כל קטגוריה שקיימת בדאטה (כולל קטגוריות-ציוד שאינן ב-8 של
 * ה-SRS — אחרת מונחים היו נעלמים), עם מונה לפי שאר הפילטרים הפעילים.
 * ממוין לפי מונה יורד ואז א-ב, כדי שהקטגוריות המאוכלסות יופיעו ראשונות.
 */
export function categoryChips(
  concepts: Concept[],
  filters: ConceptFilters,
): CategoryChip[] {
  const base = concepts.filter((c) => matchesExceptCategory(c, filters))
  const counts = new Map<string, number>()
  for (const concept of concepts) {
    if (!counts.has(concept.category)) counts.set(concept.category, 0)
  }
  for (const concept of base) {
    counts.set(concept.category, (counts.get(concept.category) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category, 'he'))
}

/** האם פילטר כלשהו פעיל (מיון אינו פילטר) — קובע את הצגת "אפס סינון". */
export function isFiltering(filters: ConceptFilters): boolean {
  return Boolean(
    filters.search.trim() ||
      filters.category ||
      filters.difficulty ||
      filters.status ||
      filters.tag,
  )
}

/** מונה-צפיות מקוצר לתצוגה על הכרטיס (1284 → "1.3K"), כמו fmt() בעיצוב. */
export function formatViews(views: number): string {
  if (views < 1000) return String(views)
  return `${(views / 1000).toFixed(1).replace(/\.0$/, '')}K`
}
