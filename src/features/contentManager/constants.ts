/**
 * קבועי מפעל התוכן — תוויות סוג, מיפוי סטטוס→צבע-Badge, ופריטי הטאבים.
 * הערכים לפי design-export/ContentManager.dc.html (TYPE/STATUS) ו-SRS §1.2.
 * אין magic strings בקומפוננטות — הכל נגזר מכאן (CLAUDE.md §4).
 */
import type { TabItem } from '@/components/ui'
import type { ContentStatus, DifficultyLevel } from '@/lib/constants/enums'
import type { ContentNodeKind } from './types'

interface TypeMeta {
  /** תווית הסוג ("מסלול"/"מודול"/"נושא"/"שיעור"). */
  label: string
  /** תווית הילד עבור שורת "הוסף ..." — null לשיעור (עלה). */
  childLabel: string | null
  /** ה-kind של הילד — null לשיעור. */
  childKind: ContentNodeKind | null
}

export const TYPE_META: Record<ContentNodeKind, TypeMeta> = {
  track: { label: 'מסלול', childLabel: 'מודול', childKind: 'module' },
  module: { label: 'מודול', childLabel: 'נושא', childKind: 'topic' },
  topic: { label: 'נושא', childLabel: 'שיעור', childKind: 'lesson' },
  lesson: { label: 'שיעור', childLabel: null, childKind: null },
}

/** Badge color type מיוצא ע"י ה-DS דרך ה-prop; כאן רק הערכים בהם נשתמש. */
export type StatusBadgeColor = 'success' | 'warning' | 'neutral'

interface StatusMeta {
  label: string
  badgeColor: StatusBadgeColor
}

/** מחזור-חיים של תוכן (SRS §1.2). 'deleted' לא מוצג בעץ — מסונן בשכבת ה-service. */
export const STATUS_META: Record<
  Exclude<ContentStatus, 'deleted'>,
  StatusMeta
> = {
  draft: { label: 'טיוטה', badgeColor: 'warning' },
  published: { label: 'פורסם', badgeColor: 'success' },
  archived: { label: 'בארכיון', badgeColor: 'neutral' },
}

export function statusMetaOf(status: ContentStatus | null | undefined): StatusMeta {
  if (status && status !== 'deleted' && status in STATUS_META) {
    return STATUS_META[status as Exclude<ContentStatus, 'deleted'>]
  }
  return STATUS_META.draft
}

/** טאבי הסטטוס בפאנל ההגדרות (design-export STATUS_TABS). */
export const STATUS_TABS: TabItem[] = [
  { id: 'draft', label: 'טיוטה' },
  { id: 'published', label: 'פורסם' },
  { id: 'archived', label: 'בארכיון' },
]

/** טאבי רמת-הקושי (design-export DIFF_TABS) — רק למסלול. */
export const DIFFICULTY_TABS: TabItem[] = [
  { id: 'beginner', label: 'מתחילים' },
  { id: 'intermediate', label: 'בינוני' },
  { id: 'advanced', label: 'מתקדם' },
]

export const DIFFICULTY_LABEL: Record<DifficultyLevel, string> = {
  beginner: 'מתחילים',
  intermediate: 'בינוני',
  advanced: 'מתקדם',
}

/** ברירת-מחדל לכותרת מסלול חדש (יצירה מהירה — הפרטים נערכים בפאנל). */
export const NEW_TRACK_TITLE = 'מסלול חדש'
export const NEW_MODULE_TITLE = 'מודול חדש'
export const NEW_TOPIC_TITLE = 'נושא חדש'
export const NEW_LESSON_TITLE = 'שיעור חדש'
