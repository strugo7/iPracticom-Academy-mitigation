/** טיפוסי ה-view של ספריית ה-Playbooks (מסמך 05) — נגזרים מ-@/types/entities. */

/** מיון הספרייה (design-export: הכי בשימוש / הצלחה גבוהה / נוסף לאחרונה). */
export type PlaybookSort = 'recent' | 'usage' | 'success'

/** מצב הפילטרים של לשונית הספרייה. `null` = "הכל". */
export interface PlaybookFilters {
  search: string
  category: string | null
  difficulty: string | null
  tag: string | null
  sort: PlaybookSort
}

export const EMPTY_FILTERS: PlaybookFilters = {
  search: '',
  category: null,
  difficulty: null,
  tag: null,
  sort: 'recent',
}

/** אפשרות בבורר-פילטר (ערך + תווית), עם מונה לתצוגה. */
export interface FilterOption {
  value: string
  label: string
}
