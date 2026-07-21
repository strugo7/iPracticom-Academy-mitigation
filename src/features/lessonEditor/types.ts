/**
 * טיפוסי עורך-השיעורים (שלב 6.2, מסמך 19). ה-EditorBlock הוא מעטפת-הבלוק
 * הגלובלית (SRS §1.2.1) — העורך פועל על אותו מבנה שהנגן מרנדר.
 */
import type { ContentStatus } from '@/lib/constants/enums'
import type {
  LessonBlockEnvelope,
  LessonVersionSnapshot,
} from '@/types/entities'
import type { EditorIconName } from './editorIcons'

export type EditorBlock = LessonBlockEnvelope

/** מצב-תצוגה של הקנבס: עריכה (עם chrome) או תצוגת-לומד (WYSIWYG נקי). */
export type ViewMode = 'edit' | 'preview'

export type BlockFamilyKey =
  | 'text'
  | 'structure'
  | 'media'
  | 'interactive'
  | 'ai'

/** פריט בקטלוג הבלוקים — סוג-בלוק אחד בפלטה/בבורר. */
export interface BlockCatalogItem {
  type: string
  label: string
  icon: EditorIconName
}

/** משפחת-בלוקים בפלטה (5 משפחות, מסמך 19 §2). */
export interface BlockFamily {
  key: BlockFamilyKey
  label: string
  /** מחלקת-Tailwind לנקודת-הצבע של המשפחה. */
  dotClass: string
  /** מחלקות רקע+צבע לאייקון-הצ'יפ של בלוקי המשפחה. */
  chipClass: string
  items: BlockCatalogItem[]
}

/** טיוטת הגדרות-השיעור בתוך המודאל (SRS §1.2 ModuleLesson). */
export interface LessonSettingsDraft {
  title: string
  introduction_text: string
  learning_objectives: string[]
  duration_minutes: number | null
  xp_reward: number | null
  require_previous_lesson: boolean
  linked_exam_id: string | null
  status: ContentStatus
}

/** מצב מחוון ה-autosave בסרגל העליון. */
export type AutosaveStatus = 'idle' | 'saving' | 'saved'

/** קלט הטעינה של העורך (שיעור + שם-מבחן מקושר לתצוגה). */
export interface LessonEditorInput {
  blocks: EditorBlock[]
  settings: LessonSettingsDraft
  linkedExamTitle: string | null
  /** תווית-מיקום בהיררכיה לתצוגה בסרגל (מסלול · נושא). */
  breadcrumb: string | null
}

export type { LessonVersionSnapshot }
