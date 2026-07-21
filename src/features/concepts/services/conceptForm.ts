/**
 * המרת ישות↔טיוטה וולידציה של אשף המונח. פונקציות טהורות — ה-hooks קוראים להן,
 * הקומפוננטות לא מכילות לוגיקה עסקית (CLAUDE.md §4).
 * שדות-החובה לפי SRS §1.9: term, short_description, full_description, category.
 */
import type { Concept } from '@/types/entities'
import {
  DEFAULT_CATEGORY,
  DEFAULT_DIFFICULTY,
  DEFAULT_STATUS,
  type EditableConceptStatus,
  EDITABLE_STATUSES,
  SHORT_DESCRIPTION_MAX,
  WIZARD_STEP_COUNT,
} from '../constants'
import type { ConceptDraft, ConceptFieldError } from '../types'

/** 'deleted' אינו ניתן לעריכה — כל ערך לא-חוקי חוזר לטיוטה. */
function toEditableStatus(status: Concept['status']): EditableConceptStatus {
  return EDITABLE_STATUSES.includes(status as EditableConceptStatus)
    ? (status as EditableConceptStatus)
    : DEFAULT_STATUS
}

export function emptyDraft(): ConceptDraft {
  return {
    term: '',
    short_description: '',
    full_description: '',
    category: DEFAULT_CATEGORY,
    difficulty_level: DEFAULT_DIFFICULTY,
    status: DEFAULT_STATUS,
    image_url: null,
    examples: [],
    external_links: [],
    synonyms: [],
    related_terms: [],
    related_lessons: [],
  }
}

export function draftFromConcept(concept: Concept): ConceptDraft {
  return {
    term: concept.term,
    short_description: concept.short_description ?? '',
    full_description: concept.full_description ?? '',
    category: concept.category,
    difficulty_level: concept.difficulty_level ?? DEFAULT_DIFFICULTY,
    status: toEditableStatus(concept.status),
    image_url: concept.image_url ?? null,
    examples: concept.examples ?? [],
    external_links: concept.external_links ?? [],
    synonyms: concept.synonyms ?? [],
    related_terms: concept.related_terms ?? [],
    related_lessons: concept.related_lessons ?? [],
  }
}

/**
 * טיוטה → payload ל-API. שדות-הטקסט מקוצצים; רשומות-קישור ריקות (בלי כותרת
 * וגם בלי URL) ודוגמאות ריקות נזרקות, כדי שלא יישמרו שורות-רפאים מהאשף.
 */
export function conceptPayload(draft: ConceptDraft): Omit<
  Concept,
  'id' | 'created_date' | 'updated_date' | 'created_by_id'
> {
  return {
    term: draft.term.trim(),
    short_description: draft.short_description.trim(),
    full_description: draft.full_description.trim(),
    category: draft.category,
    difficulty_level: draft.difficulty_level,
    status: draft.status,
    image_url: draft.image_url,
    examples: draft.examples.map((e) => e.trim()).filter(Boolean),
    external_links: draft.external_links
      .map((l) => ({ title: l.title.trim(), url: l.url.trim() }))
      .filter((l) => l.title || l.url),
    synonyms: draft.synonyms,
    related_terms: draft.related_terms,
    related_lessons: draft.related_lessons,
  }
}

/** שגיאות-חובה. מונח ריק / תיאור-קצר ריק או ארוך מדי / הסבר-מלא ריק. */
export function validateDraft(draft: ConceptDraft): ConceptFieldError[] {
  const errors: ConceptFieldError[] = []
  if (!draft.term.trim()) errors.push('term')
  const short = draft.short_description.trim()
  if (!short || short.length > SHORT_DESCRIPTION_MAX) {
    errors.push('short_description')
  }
  if (!stripHtml(draft.full_description)) errors.push('full_description')
  return errors
}

/** תוכן ה-HTML של tiptap ריק אפקטיבית כשאין בו טקסט (רק תגיות/רווחים). */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

/** השלב הראשון שבו יש שגיאה — כדי לקפוץ אליו כשמנסים לפרסם מהשלב האחרון. */
export function firstInvalidStep(errors: ConceptFieldError[]): number | null {
  if (errors.includes('term') || errors.includes('short_description')) return 1
  if (errors.includes('full_description')) return 2
  return null
}

export function clampStep(step: number): number {
  return Math.min(WIZARD_STEP_COUNT, Math.max(1, step))
}
