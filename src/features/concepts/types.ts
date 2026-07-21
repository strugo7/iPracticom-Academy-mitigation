/**
 * טיפוסי feature המונחים (שלב 6.8). ה-draft הוא מודל-הטופס של האשף — כל השדות
 * נדרשים ולא-nullable, וההמרה לישות (ולהפך) יושבת ב-services/conceptForm.
 */
import type { DifficultyLevel } from '@/lib/constants/enums'
import type { ConceptExternalLink } from '@/types/entities'
import type { EditableConceptStatus } from './constants'

/** מיון הגלריה. "מומלצים" של העיצוב הושמט — אין ל-Concept שדה is_featured. */
export type ConceptSort = 'az' | 'views'

export interface ConceptFilters {
  search: string
  /** null = כל הקטגוריות. הערך הוא ה-category הגולמי כפי שהוא בדאטה. */
  category: string | null
  difficulty: DifficultyLevel | null
  status: EditableConceptStatus | null
  /** תגית שנבחרה מכרטיס (related_terms / synonyms). */
  tag: string | null
  sort: ConceptSort
}

export const EMPTY_FILTERS: ConceptFilters = {
  search: '',
  category: null,
  difficulty: null,
  status: null,
  tag: null,
  sort: 'az',
}

/** שבב-קטגוריה בסרגל, עם מונה התוצאות שייוותרו אם ייבחר. */
export interface CategoryChip {
  category: string
  count: number
}

/** מודל-הטופס של האשף. */
export interface ConceptDraft {
  term: string
  short_description: string
  full_description: string
  category: string
  difficulty_level: DifficultyLevel
  status: EditableConceptStatus
  image_url: string | null
  examples: string[]
  external_links: ConceptExternalLink[]
  synonyms: string[]
  related_terms: string[]
  /** מזהי ModuleLesson — ה-junction concept_lessons (שיעורים בלבד). */
  related_lessons: string[]
}

/** פריט-תוכן מקושר, מועשר לתצוגה (כותרת + הקשר) מתוך ModuleLesson. */
export interface LinkedLesson {
  lessonId: string
  title: string
  /** הקשר לתצוגה — "מסלול · <נושא>" כשידוע, אחרת תווית ניטרלית. */
  meta: string
}

/** שגיאות-ולידציה פר-שדה, ממופות לשלב שבו הן מוצגות. */
export type ConceptFieldError = 'term' | 'short_description' | 'full_description'
