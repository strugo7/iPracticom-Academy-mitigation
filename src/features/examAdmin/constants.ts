/**
 * מטא-נתונים לתצוגה של מאגר-השאלות ובונה-המבחנים (Phase 6.6, מסמך 13).
 * תוויות עברית + צבעי DS-Badge לכל enum. מקור-האמת ל-enum עצמו:
 * lib/constants/enums.ts (QUESTION_TYPES ‏3 סוגים — 'matching' הוסר במכוון,
 * ראו entities.ts). הצבעים תואמים design-export/Question Bank + Exam Builder.
 */
import type {
  ContentStatus,
  DifficultyLevel,
  ExamType,
  QuestionType,
} from '@/lib/constants/enums'

/** צבע DS-Badge — תת-קבוצה מתוך האיחוד המלא של Badge (color). */
export type BadgeColor =
  | 'accent'
  | 'success'
  | 'warning'
  | 'caution'
  | 'neutral'
  | 'bronze'
  | 'denim'
  | 'indigo'

interface TypeMeta {
  label: string
  color: BadgeColor
}

/** סוגי-שאלה — 3 הסוגים הנתמכים (design-export: רב-ברירה/נכון-לא-נכון/סידור). */
export const QUESTION_TYPE_META: Record<QuestionType, TypeMeta> = {
  multiple_choice: { label: 'רב-ברירה', color: 'accent' },
  true_false: { label: 'נכון / לא נכון', color: 'success' },
  order_sequence: { label: 'סידור', color: 'bronze' },
}

/** רמת-קושי (enum beginner/intermediate/advanced) — תוויות עברית קל/בינוני/קשה. */
export const DIFFICULTY_META: Record<DifficultyLevel, TypeMeta> = {
  beginner: { label: 'קל', color: 'success' },
  intermediate: { label: 'בינוני', color: 'warning' },
  advanced: { label: 'קשה', color: 'caution' },
}

/** מחזור-חיים של תוכן — כאן רק 3 הערכים הרלוונטיים לעריכה (לא 'deleted'). */
export const STATUS_META: Record<
  Extract<ContentStatus, 'draft' | 'published' | 'archived'>,
  TypeMeta
> = {
  published: { label: 'פורסם', color: 'success' },
  draft: { label: 'טיוטה', color: 'warning' },
  archived: { label: 'בארכיון', color: 'neutral' },
}

interface ExamTypeMeta extends TypeMeta {
  /** תווית קצרה ל-Tabs-pill */
  short: string
  /** תווית שדה-הקישור בבונה (design-export: linkLabel) */
  linkLabel: string
}

/** סוג-מבחן (Exam.exam_type) — צבע+תווית+שם-שדה-קישור. */
export const EXAM_TYPE_META: Record<ExamType, ExamTypeMeta> = {
  track_exam: { label: 'מסלול', short: 'מסלול', color: 'denim', linkLabel: 'מקושר למסלול' },
  module_exam: { label: 'מודול', short: 'מודול', color: 'success', linkLabel: 'מקושר למודול' },
  topic_exam: { label: 'נושא', short: 'נושא', color: 'indigo', linkLabel: 'מקושר לנושא' },
  lesson_exam: { label: 'שיעור', short: 'שיעור', color: 'bronze', linkLabel: 'מקושר לשיעור' },
  standalone_exam: { label: 'עצמאי', short: 'עצמאי', color: 'neutral', linkLabel: 'הגדרת מבחן' },
}

/** קטגוריית ברירת-מחדל כלל-ארגונית (זמינה לכל מחלקה) — כמו ב-learning. */
export const COMPANY_WIDE_CATEGORY = 'כלל החברה'

/** ניקוד ברירת-מחדל לשאלה חדשה (SRS §1.4 points def 1; העיצוב מדגים 5). */
export const DEFAULT_QUESTION_POINTS = 1

/** ציון-מעבר ברירת-מחדל למבחן (SRS §1.4 passing_score def 70). */
export const DEFAULT_PASSING_SCORE = 70

/** מספר תשובות מינימלי לשאלת רב-ברירה. */
export const MIN_CHOICE_OPTIONS = 2

/** מספר פריטים מינימלי לשאלת-סידור. */
export const MIN_ORDER_ITEMS = 2
