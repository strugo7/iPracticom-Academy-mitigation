/**
 * סינון וחיפוש במאגר-השאלות (צד-לקוח) + גזירת רשימת-הקטגוריות מהדאטה בפועל
 * (הקטגוריות אינן enum קשיח בדאטה — ראו CLAUDE.md; גוזרים מהרשומות במקום להמציא).
 * פונקציות טהורות — נבדקות, ומופרדות מה-hook.
 */
import type { Question } from '@/types/entities'
import { COMPANY_WIDE_CATEGORY } from '../constants'
import type { QuestionFilters } from '../types'

/** התאמת שאלה יחידה לכל הפילטרים הפעילים (search מחפש בנוסח + קטגוריה). */
function matches(q: Question, filters: QuestionFilters): boolean {
  const term = filters.search.trim()
  if (term && !q.question_text.includes(term) && !q.category.includes(term))
    return false
  if (filters.category && q.category !== filters.category) return false
  if (filters.questionType && q.question_type !== filters.questionType)
    return false
  if (filters.difficulty && q.difficulty_level !== filters.difficulty)
    return false
  if (filters.status && q.status !== filters.status) return false
  return true
}

export function filterQuestions(
  list: Question[],
  filters: QuestionFilters,
): Question[] {
  return list.filter((q) => matches(q, filters))
}

/** רשימת קטגוריות ייחודיות מהדאטה — 'כלל החברה' תמיד ראשונה אם קיימת. */
export function categoryOptions(list: Question[]): string[] {
  const set = new Set<string>()
  for (const q of list) if (q.category) set.add(q.category)
  const all = [...set].sort((a, b) => a.localeCompare(b, 'he'))
  if (set.has(COMPANY_WIDE_CATEGORY)) {
    return [COMPANY_WIDE_CATEGORY, ...all.filter((c) => c !== COMPANY_WIDE_CATEGORY)]
  }
  return all
}

/** תקציר-תצוגה קצר של שאלה (design-export: preview בפאנל-ההוספה). */
export function questionPreview(q: Question): string {
  switch (q.question_type) {
    case 'multiple_choice':
      return (q.options ?? []).join(' · ')
    case 'true_false': {
      const correct = (q.correct_answer_index ?? 0) === 0 ? 'נכון' : 'לא נכון'
      return `נכון / לא נכון — התשובה: ${correct}`
    }
    case 'order_sequence': {
      const items = q.order_items ?? []
      return `${items.length} פריטים לסידור: ${items.map((i) => i.text).join(' → ')}`
    }
  }
}

/** האם קיים לפחות פילטר אחד פעיל (לתג "מסונן"). */
export function hasActiveFilters(filters: QuestionFilters): boolean {
  return Boolean(
    filters.search.trim() ||
      filters.category ||
      filters.questionType ||
      filters.difficulty ||
      filters.status,
  )
}
